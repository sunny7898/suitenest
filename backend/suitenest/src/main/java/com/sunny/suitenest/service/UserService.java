package com.sunny.suitenest.service;

import com.sunny.suitenest.model.User;

import java.util.List;

public interface UserService {
    User registerUser(User user);

    List<User> getAllUsers();

    void deleteUser(String email);

    User getUserByEmail(String email);
}
