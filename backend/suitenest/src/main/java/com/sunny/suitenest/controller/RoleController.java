package com.sunny.suitenest.controller;


import com.sunny.suitenest.exception.RoleAlreadyExistException;
import com.sunny.suitenest.model.Role;
import com.sunny.suitenest.model.User;
import com.sunny.suitenest.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.FOUND;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/all-roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return new ResponseEntity<>(roleService.getAllRoles(), FOUND);
    }

    @PostMapping("/create-new-role")
    public ResponseEntity<String> createRole(@RequestBody Role newRole) {
        try {
            roleService.createRole(newRole);
            return ResponseEntity.ok("New role created successfully!");
        } catch (RoleAlreadyExistException err) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err.getMessage());
        }
    }

    @DeleteMapping("/delete/{roleId}")
    public void deleteRole(@PathVariable("roleId") Long roleId) {
        roleService.deleteRole(roleId);
    }

    @PostMapping("/remove-all-users-from-role/{roleId}")
    public Role removeAllUsersFromRole(@PathVariable("roleId") Long roleId) {
        return roleService.removeAllUsersFromRole(roleId);
    }

    @PostMapping("/remove-user-from-role/?userId={userId}&&roleId={roleId}")
    public User removeUser(@RequestParam("userId") Long userId, @RequestParam("roleId") Long roleId){
        return roleService.removeUserFromRole(userId, roleId);
    }

    @PostMapping("/assign-role-to-user/?userId={userId}&&roleId={roleId}")
    public User assignRoleToUser(@RequestParam("userId") Long userId, @RequestParam("roleId") Long roleId){
        return roleService.assignRoleToUser(userId, roleId);
    }

}
