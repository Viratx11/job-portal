package com.virat.job.PayLoad;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String phone;
    private String profilePicture;
}
