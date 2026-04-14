package com.aman.springboot.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aman.springboot.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, String> {
        Optional<User> findByUsername(String username);
        List<User> findAllByUsername(String username);
        Optional<User> findByEmail(String email);
}
