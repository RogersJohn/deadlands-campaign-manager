package com.deadlands.campaign.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Only log for session endpoints to reduce noise
        boolean isSessionEndpoint = requestURI.contains("/sessions");

        if (isSessionEndpoint) {
            System.out.println("========== JWT FILTER DEBUG ==========");
            System.out.println("Request URI: " + requestURI);
            System.out.println("Method: " + request.getMethod());
        }

        try {
            String jwt = getJwtFromRequest(request);

            if (isSessionEndpoint) {
                System.out.println("Authorization Header: " + (jwt != null ? "Present" : "MISSING"));
            }

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);

                if (isSessionEndpoint) {
                    System.out.println("JWT Valid - Username: " + username);
                }

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                if (isSessionEndpoint) {
                    System.out.println("UserDetails loaded: " + userDetails.getUsername());
                    System.out.println("Authorities: " + userDetails.getAuthorities());
                }

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                if (isSessionEndpoint) {
                    System.out.println("✓ Authentication SET in SecurityContext");
                }
            } else if (isSessionEndpoint && StringUtils.hasText(jwt)) {
                System.out.println("✗ JWT validation FAILED");
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
            if (isSessionEndpoint) {
                System.out.println("✗ Exception: " + ex.getMessage());
                ex.printStackTrace();
            }
        }

        if (isSessionEndpoint) {
            System.out.println("Final Authentication: " +
                (SecurityContextHolder.getContext().getAuthentication() != null ?
                    SecurityContextHolder.getContext().getAuthentication().getName() + " [" +
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities() + "]" :
                    "NULL"));
            System.out.println("======================================");
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
