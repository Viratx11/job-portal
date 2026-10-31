package com.virat.job.controller;

import com.virat.job.PayLoad.AuthResponse;
import com.virat.job.PayLoad.LoginRequest;
import com.virat.job.PayLoad.SignUpRequest;
import com.virat.job.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody @Valid SignUpRequest req) throws Exception{

        return ResponseEntity.ok(authService.signup(req));
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req) throws Exception{
        AuthResponse authResponse=authService.login(req);
        return ResponseEntity.ok(authResponse);
    }

}
