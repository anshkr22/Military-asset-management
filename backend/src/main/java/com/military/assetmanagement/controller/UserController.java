package com.military.assetmanagement.controller;

import com.military.assetmanagement.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> {
                    Map<String, Object> data = new HashMap<>();

                    data.put("id", user.getId());
                    data.put("username", user.getUsername());
                    data.put("fullName", user.getFullName());

                    if (user.getBase() != null) {
                        data.put("baseId", user.getBase().getId());
                        data.put("baseName", user.getBase().getName());
                    } else {
                        data.put("baseId", null);
                        data.put("baseName", null);
                    }

                    return data;
                })
                .toList();
    }
}