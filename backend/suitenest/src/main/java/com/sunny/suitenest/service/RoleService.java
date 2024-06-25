package com.sunny.suitenest.service;

import com.sunny.suitenest.model.Role;
import com.sunny.suitenest.model.User;

import java.util.List;

public interface RoleService {
    List<Role> getAllRoles();

    Role createRole(Role role);

    void deleteRole(Long roleId);

    Role findByName(String name);

    User removeUserFromRole(Long userId, Long roleId);

    User assignRoleToUser(Long userId, Long roleId);

    Role removeAllUsersFromRole(Long roleId);

}
