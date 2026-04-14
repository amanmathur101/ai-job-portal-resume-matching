package com.aman.springboot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.aman.springboot.model.User;
import com.aman.springboot.model.UserPrincipal;
import com.aman.springboot.repo.UserRepo;


@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo repo;

   @Override
   public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

    System.out.println("Looking for user by email: " + email);

    User user = repo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

    System.out.println("User found: " + user.getEmail() + " role: " + user.getRole());

    return new UserPrincipal(user);
}


}


