package com.virat.job.service;

import com.virat.job.PayLoad.AuthResponse;
import com.virat.job.PayLoad.LoginRequest;
import com.virat.job.PayLoad.SignUpRequest;

public interface AuthService {

    AuthResponse signup (SignUpRequest req) throws Exception;
    AuthResponse login (LoginRequest req) throws Exception;

}
