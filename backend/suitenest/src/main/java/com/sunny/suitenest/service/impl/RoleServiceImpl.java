package com.sunny.suitenest.service.impl;

import com.sunny.suitenest.exception.RoleAlreadyExistException;
import com.sunny.suitenest.exception.UserAlreadyExistException;
import com.sunny.suitenest.model.Role;
import com.sunny.suitenest.model.User;
import com.sunny.suitenest.repository.RoleRepository;
import com.sunny.suitenest.repository.UserRepository;
import com.sunny.suitenest.service.RoleService;
import com.sunny.suitenest.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private  final UserRepository userRepository;

    @Override
    public List<Role> getRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role createRole(Role theRole) {
        String roleName = "ROLE_" + theRole.getName().toUpperCase();
        Role role = new Role(roleName);

        if (roleRepository.existsByName(roleName)){
            throw new RoleAlreadyExistException(theRole.getName() + " role already exists");
        }
        return roleRepository.save(role);
    }

    @Override
    public void deleteRole(Long roleId) {
        this.removeAllUsersFromRole(roleId);
        roleRepository.deleteById(roleId);
    }

    @Override
    public Role findByName(String name) {
        return roleRepository.findByName(name).get();
    }

    @Override
    public User removeUserFromRole(Long userId, Long roleId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Role> role = roleRepository.findById(roleId);

        if (role.isPresent() && role.get().getUsers().contains(user.get())) {
            role.get().removeUserFromRole(user.get());
            roleRepository.save(role.get());
            return user.get();
        }
        throw new UsernameNotFoundException("User not found");
    }

    @Override
    public User assignRoleToUser(Long userId, Long roleId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Role> role = roleRepository.findById(roleId);

        if (user.isPresent() && user.get().getRoles().contains(role.get())) {
            throw new UserAlreadyExistException(
                user.get().getFirstName() + " is already assigned to the " + role.get().getName() + " role");
        }

        if (role.isPresent()) {
            role.get().assignRoleToUser(user.get());
            roleRepository.save(role.get());
        }
        return user.get();
    }

    @Override
    public Role removeAllUsersFromRole(Long roleId) {
        Optional<Role> role = roleRepository.findById(roleId);
        role.ifPresent(Role::removeAllUsersFromRole);

        /*
            Above code in simpler terms
            if (role.isPresent()) {
               role.get().removeAllUsersFromRole();
            }
         */

        return roleRepository.save(role.get());
    }
}
