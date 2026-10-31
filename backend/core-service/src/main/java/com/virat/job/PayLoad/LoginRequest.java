package com.virat.job.PayLoad;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @Email(message = "Enter a valid Email")
    @NotBlank(message = "Email is mandatory")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;
}
