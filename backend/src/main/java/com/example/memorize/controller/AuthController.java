package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.dto.LoginRequest;
import com.example.memorize.entity.SysUser;
import com.example.memorize.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        return Result.ok(authService.login(req));
    }

    @PostMapping("/register")
    public Result<SysUser> register(@Valid @RequestBody LoginRequest req) {
        return Result.ok(authService.register(req));
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        authService.logout();
        return Result.ok();
    }

    @GetMapping("/info")
    public Result<SysUser> info() {
        return Result.ok(authService.current());
    }
}
