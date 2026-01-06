package com.budget_buddy.service;

import com.budget_buddy.dto.UserRequest;
import com.budget_buddy.dto.UserResponse;
import com.budget_buddy.model.User;
import com.budget_buddy.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponse register(UserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);

        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
