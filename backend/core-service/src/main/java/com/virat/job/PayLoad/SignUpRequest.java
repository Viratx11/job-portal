package com.virat.job.PayLoad;

import com.virat.job.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class SignUpRequest {
    @NotBlank(message = "FullName is mandatory")
    private String fullName;

    @Email(message = "Enter a valid Email")
    @NotBlank(message = "Email is mandatory")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    @NotBlank(message = "Phone Number is mandatory")
    private String phone;

    @NotNull(message = "Role is mandatory")
    private UserRole role;
}
