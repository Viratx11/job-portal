package com.virat.job.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final SecretKey secretKey = Keys.hmacShaKeyFor(JwtConstant.JWT_SECRET.getBytes());

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(secretKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String email = String.valueOf(claims.get("email"));
                String authoritiesStr = claims.get("authorities") != null
                        ? String.valueOf(claims.get("authorities"))
                        : "";
                Object userIdClaim = claims.get("userId");
                String verifiedUserId = userIdClaim != null ? String.valueOf(((Number) userIdClaim).longValue()) : null;

                List<GrantedAuthority> authorities = AuthorityUtils.commaSeparatedStringToAuthorityList(authoritiesStr);
                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Override X-User-Id and X-User-Email with verified JWT claims to prevent header spoofing
                HttpServletRequest wrappedRequest = new HttpServletRequestWrapper(request) {
                    @Override
                    public String getHeader(String name) {
                        if ("X-User-Id".equalsIgnoreCase(name) && verifiedUserId != null) {
                            return verifiedUserId;
                        }
                        if ("X-User-Email".equalsIgnoreCase(name) && email != null) {
                            return email;
                        }
                        return super.getHeader(name);
                    }

                    @Override
                    public Enumeration<String> getHeaders(String name) {
                        if ("X-User-Id".equalsIgnoreCase(name) && verifiedUserId != null) {
                            return Collections.enumeration(Collections.singletonList(verifiedUserId));
                        }
                        if ("X-User-Email".equalsIgnoreCase(name) && email != null) {
                            return Collections.enumeration(Collections.singletonList(email));
                        }
                        return super.getHeaders(name);
                    }
                };

                filterChain.doFilter(wrappedRequest, response);
                return;
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}

