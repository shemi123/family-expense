package com.familybudget.service;

import com.familybudget.domain.entity.Family;
import com.familybudget.domain.entity.User;
import com.familybudget.domain.enums.Role;
import com.familybudget.dto.auth.*;
import com.familybudget.exception.BadRequestException;
import com.familybudget.exception.ResourceNotFoundException;
import com.familybudget.exception.UnauthorizedException;
import com.familybudget.repository.FamilyRepository;
import com.familybudget.repository.UserRepository;
import com.familybudget.security.JwtTokenProvider;
import com.familybudget.security.TenantContext;
import com.familybudget.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Family family = Family.builder()
                .name(request.getFamilyName())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .build();
        family = familyRepository.save(family);

        User user = User.builder()
                .family(family)
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();
        user = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal, family.getName());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .familyId(family.getId())
                .familyName(family.getName())
                .currency(family.getCurrency())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Family family = familyRepository.findById(principal.getFamilyId())
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        String token = tokenProvider.generateToken(principal, family.getName());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(principal.getId())
                .name(principal.getName())
                .email(principal.getEmail())
                .role(principal.getRole())
                .familyId(principal.getFamilyId())
                .familyName(family.getName())
                .currency(family.getCurrency())
                .build();
    }

    @Transactional
    public UserDto addMember(AddMemberRequest request, UserPrincipal currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only family ADMIN can add members to the family");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        UUID familyId = TenantContext.getCurrentFamilyId();
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        User user = User.builder()
                .family(family)
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        user = userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getFamilyMembers() {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return userRepository.findAllByFamilyId(familyId).stream()
                .map(UserDto::from)
                .toList();
    }
}
