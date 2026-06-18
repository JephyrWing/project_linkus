package com.my.project_linkus_back.common.service;

import com.my.project_linkus_back.common.exception.UserNotFoundException;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UsersRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UserNotFoundException {
        // userId로 엔티티 가져오기
        if (!userRepository.existsByUserId(userId)) return null;

        Users userData = userRepository.findByUserId(userId).orElse(null);
        return new CustomUserDetails(userData);
    }
}
