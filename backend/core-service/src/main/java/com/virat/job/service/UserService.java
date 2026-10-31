package com.virat.job.service;

import com.virat.job.PayLoad.UpdateUserRequest;
import com.virat.job.domain.UserRole;
import com.virat.job.dto.response.UserResponse;
import com.virat.job.modal.User;

import java.util.List;

public interface UserService {

    User getUserByEmail (String email) throws Exception;

    User getUserById (Long id) throws Exception;

    List<User> getAllUsers() throws Exception;

    UserResponse updateProfile(String email, UpdateUserRequest req) throws Exception;

    // admin actions

    UserResponse suspendUser(Long id) throws Exception;

    UserResponse activateUser(Long id) throws Exception;

    UserResponse deactivateUser(Long id) throws Exception;

    UserResponse changeUserRole(Long id, UserRole role) throws Exception;

}
