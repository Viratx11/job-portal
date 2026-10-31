package com.virat.job.mapper;

import com.virat.job.dto.response.UserResponse;
import com.virat.job.modal.User;

import java.util.List;
import java.util.stream.Collectors;

public class UserMapper {

    public static UserResponse toDTO(User user){
        UserResponse userResponse=new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setFullName(user.getFullName());
        userResponse.setEmail(user.getEmail());
        userResponse.setPhone(user.getPhone());
        userResponse.setProfileImage(user.getProfileImage());
        userResponse.setRole(user.getRole());
        userResponse.setUserStatus(user.getUserStatus());
        userResponse.setLastLogin(user.getLastLogin());
        userResponse.setCreatedAt(user.getCreatedAt());
        return userResponse;
    }

    public static List<UserResponse> toDTO(List<User> users){
        return users.stream().map(UserMapper::toDTO).collect(Collectors.toList());
    }
}
