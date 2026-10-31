package com.virat.job.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Service
public class JwtProvider {

    private  final SecretKey secretKey= Keys.hmacShaKeyFor(JwtConstant.JWT_SECRET.getBytes());

    public String generateJwtToken(Authentication authentication,Long userId) {
        Collection<? extends GrantedAuthority> grantedAuthorities = authentication.getAuthorities();
        String role=populateAuthorities(grantedAuthorities);

        return Jwts.builder()
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+864000000))
                .claim("email",authentication.getName())
                .claim("authorities",role)
                .claim("userId",userId).signWith(secretKey).compact();
    }

    private String populateAuthorities(Collection<? extends GrantedAuthority> grantedAuthorities) {
        Set<String> auths=new HashSet<>();
        for(GrantedAuthority grantedAuthority:grantedAuthorities){
            auths.add(grantedAuthority.getAuthority());
        }
        return String.join(",",auths);
    }
}
