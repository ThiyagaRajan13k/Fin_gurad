package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.AuthRequest;
import com.finguard.dto.AuthResponse;
import com.finguard.entity.Role;
import com.finguard.entity.User;
import com.finguard.repository.UserRepository;
import com.finguard.security.JwtTokenProvider;
import com.finguard.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private com.finguard.service.DataSeederService dataSeederService;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        
        auditLogService.logAction("Authentication", "User Login", "User", user.getId().toString());
        
        return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), user.getRole().name(), user.getFullName()));
    }

    // Temporary init endpoint for setup purposes
    @PostMapping("/init")
    public ResponseEntity<?> initUsers() {
        if (userRepository.count() == 0) {
            createUser("admin", "admin123", "System Admin", "admin@finguard.com", Role.ROLE_ADMIN);
            createUser("supplier", "supplier123", "Test Supplier", "supplier@finguard.com", Role.ROLE_SUPPLIER);
            createUser("bank", "bank123", "Bank Officer", "bank@finguard.com", Role.ROLE_BANK_OFFICER);
            createUser("fraud", "fraud123", "Fraud Analyst", "fraud@finguard.com", Role.ROLE_FRAUD_ANALYST);
        }
        
        dataSeederService.seedMasterData();
        
        return ResponseEntity.ok(new ApiResponse(true, "System Initialized"));
    }
    
    private void createUser(String username, String password, String fullName, String email, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setRole(role);
        userRepository.save(user);
    }
}
