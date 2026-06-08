package com.webtech.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(com.webtech.backend.config.CloudinaryProperties properties) {
        if (properties.hasCredentials()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", properties.getCloudName(),
                    "api_key", properties.getApiKey(),
                    "api_secret", properties.getApiSecret()
            ));
        } else {
            String url = System.getenv("CLOUDINARY_URL");
            if (url != null && !url.isBlank()) {
                cloudinary = new Cloudinary(url);
            } else {
                throw new IllegalStateException("Cloudinary credentials are not configured. Set cloudinary.cloud-name, cloudinary.api-key, cloudinary.api-secret in application.properties or CLOUDINARY_URL as an environment variable.");
            }
        }
    }

    public String upload(MultipartFile file, String folder) throws IOException {
        Map<?, ?> res = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", folder));
        Object secure = res.get("secure_url");
        return secure == null ? null : secure.toString();
    }
}
