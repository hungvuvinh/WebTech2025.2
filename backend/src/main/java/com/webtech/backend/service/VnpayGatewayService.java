package com.webtech.backend.service;

import com.webtech.backend.config.VnpayProperties;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.OrderItem;
import com.webtech.backend.model.Payment;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.TreeMap;

@Service
public class VnpayGatewayService {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private static final Logger logger = LoggerFactory.getLogger(VnpayGatewayService.class);

    private final VnpayProperties properties;

    public VnpayGatewayService(VnpayProperties properties) {
        this.properties = properties;
    }

    public String buildPaymentUrl(Order order, Payment payment, String clientIpAddress) {
        validateProperties();

        long amount = parseAmount(order.getTotalAmount());
        String paymentRef = payment.getId() != null ? payment.getId() : order.getId();
        String command = trim(properties.getCommand());
        String currCode = trim(properties.getCurrCode());
        String locale = trim(properties.getLocale());
        String orderType = trim(properties.getOrderType());
        String returnUrl = trim(properties.getReturnUrl());
        String tmnCode = trim(properties.getTmnCode());
        String version = trim(properties.getVersion());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Amount", String.valueOf(amount * 100L));
        params.put("vnp_Command", command);
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).truncatedTo(ChronoUnit.SECONDS);
        params.put("vnp_CreateDate", VNPAY_DATE_FORMAT.format(now));
        params.put("vnp_CurrCode", currCode);
        params.put("vnp_IpAddr", clientIpAddress == null || clientIpAddress.isBlank() ? "127.0.0.1" : clientIpAddress);
        params.put("vnp_Locale", locale);
        params.put("vnp_OrderInfo", buildOrderInfo(order));
        params.put("vnp_OrderType", orderType);
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_TxnRef", paymentRef);
        params.put("vnp_Version", version);
        params.put("vnp_ExpireDate", VNPAY_DATE_FORMAT.format(now.plusMinutes(properties.getExpireMinutes())));

        String query = buildQueryString(params);
        String secureHash = hmacSha512(trim(properties.getSecretKey()), query);
        if (logger.isDebugEnabled()) {
            logger.debug("VNPay canonical query: {}", query);
            logger.debug("VNPay computed secureHash: {}", secureHash);
        }
        return trim(properties.getPayUrl()) + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean isValidSignature(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            return false;
        }

        Map<String, String> signingParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            if (key == null) {
                continue;
            }
            if ("vnp_SecureHash".equalsIgnoreCase(key) || "vnp_SecureHashType".equalsIgnoreCase(key)) {
                continue;
            }
            String value = entry.getValue();
            if (value != null && !value.isBlank()) {
                signingParams.put(key, value);
            }
        }

        String query = buildQueryString(signingParams);
        String expected = hmacSha512(trim(properties.getSecretKey()), query);
        if (logger.isDebugEnabled()) {
            logger.debug("VNPay callback canonical query: {}", query);
            logger.debug("VNPay callback received vnp_SecureHash: {}", secureHash);
            logger.debug("VNPay callback computed expected hash: {}", expected);
        }
        return expected.equalsIgnoreCase(secureHash);
    }

    public String getIpnUrl() {
        return properties.getIpnUrl();
    }

    private void validateProperties() {
        if (isBlank(trim(properties.getPayUrl()))
            || isBlank(trim(properties.getTmnCode()))
            || isBlank(trim(properties.getSecretKey()))
            || isBlank(trim(properties.getReturnUrl()))
            || isBlank(trim(properties.getIpnUrl()))) {
            logger.error("VNPay configuration missing: payUrl={}, tmnCode={}, secretKeySet={}, returnUrl={}, ipnUrl={}",
                    properties.getPayUrl(), properties.getTmnCode(),
                    properties.getSecretKey() != null && !properties.getSecretKey().isBlank(),
                    properties.getReturnUrl(), properties.getIpnUrl());
            throw new IllegalStateException("VNPay configuration is missing. Set app.vnpay.pay-url, tmn-code, secret-key, return-url, and ipn-url.");
        }
    }

    private long parseAmount(String totalAmount) {
        if (totalAmount == null || totalAmount.isBlank()) {
            return 0L;
        }

        try {
            return Long.parseLong(totalAmount);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid order total amount: " + totalAmount, ex);
        }
    }

    private String buildOrderInfo(Order order) {
        // Keep order info simple ASCII to avoid gateway-side normalization differences.
        return "Thanh toan don hang " + (order.getId() != null ? order.getId() : "unknown");
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder builder = new StringBuilder();
        boolean first = true;

        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                builder.append('&');
            }
            first = false;
            builder.append(encode(entry.getKey()));
            builder.append('=');
            builder.append(encode(entry.getValue()));
        }

        return builder.toString();
    }

    private String encode(String value) {
        // Match VNPay demo exactly: application/x-www-form-urlencoded style where spaces become '+'.
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }

    private String hmacSha512(String secretKey, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(keySpec);
            byte[] result = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(result.length * 2);
            for (byte b : result) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            logger.error("Error generating VNPay secure hash", ex);
            throw new IllegalStateException("Cannot generate VNPay secure hash", ex);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}