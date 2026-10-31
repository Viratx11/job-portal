package com.virat.job.service.impl;

import com.virat.job.PayLoad.UpdateUserRequest;
import com.virat.job.domain.UserRole;
import com.virat.job.domain.UserStatus;
import com.virat.job.dto.response.UserResponse;
import com.virat.job.mapper.UserMapper;
import com.virat.job.modal.User;
import com.virat.job.repository.UserRepository;
import com.virat.job.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) throws Exception {
        User user=userRepository.findByEmail(email);
        if(user==null){
            throw new Exception("user not found");
        }
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) throws Exception {
        return userRepository.findById(id).orElseThrow(
                ()->new Exception("User not found")
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() throws Exception {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateUserRequest req) throws Exception {
        User user=getUserByEmail(email);
        if(req.getFullName()!=null){
            user.setFullName(req.getFullName());
        }
        if(req.getPhone()!=null){
            user.setPhone(req.getPhone());
        }
        if(req.getProfilePicture()!=null){
            user.setProfileImage(req.getProfilePicture());
        }
        return UserMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse suspendUser(Long id) throws Exception {
        User user=getUserById(id);
        user.setUserStatus(UserStatus.SUSPENDED);
        user.setSuspendAt(LocalDateTime.now());

        return UserMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse activateUser(Long id) throws Exception {
        User user=getUserById(id);
        user.setUserStatus(UserStatus.ACTIVE);
        user.setSuspendAt(null);

        return UserMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse deactivateUser(Long id) throws Exception {
        User user=getUserById(id);
        user.setUserStatus(UserStatus.DELETED);
        user.setDeletedAt(LocalDateTime.now());

        return UserMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse changeUserRole(Long id, UserRole role) throws Exception {
        User user = getUserById(id);
        user.setRole(role);
        return UserMapper.toDTO(userRepository.save(user));
    }
}
