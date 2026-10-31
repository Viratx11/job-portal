package com.virat.job.service.impl;

import com.virat.job.PayLoad.AuthResponse;
import com.virat.job.PayLoad.LoginRequest;
import com.virat.job.PayLoad.SignUpRequest;
import com.virat.job.domain.UserRole;
import com.virat.job.domain.UserStatus;
import com.virat.job.mapper.UserMapper;
import com.virat.job.modal.User;
import com.virat.job.repository.UserRepository;
import com.virat.job.security.CustomUserDetailsService;
import com.virat.job.security.JwtProvider;
import com.virat.job.service.AuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    @Transactional
    public AuthResponse signup(SignUpRequest req) throws Exception {
        if(userRepository.existsByEmail(req.getEmail())){
            throw new Exception("Email Already Regsitered"+req.getEmail());
        }
        if(req.getRole()== UserRole.ROLE_ADMIN){
            throw new Exception("Cannot self regsiter as Admin");
        }
        User user=User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .phone(req.getPhone())
                .profileImage("")
                .userStatus(UserStatus.ACTIVE)
                .lastLogin(LocalDateTime.now())
                .build();
        User savedUser=userRepository.save(user);

        Authentication authentication=new UsernamePasswordAuthenticationToken(user.getEmail(),user.getPassword());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt= jwtProvider.generateJwtToken(authentication,savedUser.getId());

        AuthResponse authResponse=new AuthResponse();
        authResponse.setTitle("User Register"+user.getFullName());
        authResponse.setMessage("Successful Register");
        authResponse.setJwt(jwt);
        authResponse.setUser(UserMapper.toDTO(user));
        return authResponse;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req) throws Exception {

        Authentication authentication=authenticate(
                req.getEmail(),req.getPassword()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user=userRepository.findByEmail(req.getEmail());
        String jwt= jwtProvider.generateJwtToken(authentication,user.getId());
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        AuthResponse authResponse=new AuthResponse();
        authResponse.setTitle("Welcome Back, " + user.getFullName());
        authResponse.setMessage("Successful Login");
        authResponse.setJwt(jwt);
        authResponse.setUser(UserMapper.toDTO(user));

        return authResponse;
    }

    private Authentication authenticate( String email, String password) throws Exception {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        
        if(!passwordEncoder.matches(password,userDetails.getPassword())){
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "password is wrong !"
            );
        }
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}
