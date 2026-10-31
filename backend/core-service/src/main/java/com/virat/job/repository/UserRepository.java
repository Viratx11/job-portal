package com.virat.job.repository;

import com.virat.job.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail (String email);
    boolean existsByEmail (String email);
}
