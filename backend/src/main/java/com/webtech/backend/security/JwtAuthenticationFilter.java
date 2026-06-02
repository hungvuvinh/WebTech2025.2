package com.webtech.backend.security;

import com.webtech.backend.model.AuthAccount;
import com.webtech.backend.repository.AuthAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthAccountRepository authAccountRepository;

    public JwtAuthenticationFilter(JwtService jwtService, AuthAccountRepository authAccountRepository) {
        this.jwtService = jwtService;
        this.authAccountRepository = authAccountRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        if (!jwtService.isTokenValid(token) || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = jwtService.extractUserId(token);
        AuthAccount account = authAccountRepository.findById(userId).orElse(null);
        if (account == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String role = account.getRole() == null ? "" : account.getRole().toUpperCase();
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                account.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }
}
