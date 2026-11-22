package com.example.memorize.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.example.memorize.common.Result;
import com.example.memorize.dto.LoginRequest;
import com.example.memorize.entity.SysUser;
import com.example.memorize.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final List<String> ALLOWED_EXTS = List.of("jpg", "jpeg", "png", "webp", "gif");

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

    @PatchMapping("/profile")
    public Result<SysUser> updateProfile(@RequestBody Map<String, String> body) {
        return Result.ok(authService.updateProfile(body.get("nickname"), body.get("avatar")));
    }

    /**
     * 头像上传：POST multipart/form-data, field name = file
     * 返回可访问的相对路径，例如 /uploads/avatar/1_1700000000000-abcd1234.png
     */
    @PostMapping("/upload-avatar")
    public Result<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("未选择文件");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("文件大小超过 2MB");
        }

        String contentType = file.getContentType();
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                : "";

        boolean typeOk = contentType != null && ALLOWED_TYPES.contains(contentType.toLowerCase());
        boolean extOk = ALLOWED_EXTS.contains(ext);
        if (!typeOk && !extOk) {
            throw new IllegalArgumentException("仅支持 JPG/PNG/WebP/GIF 格式图片");
        }
        if (ext.isEmpty()) ext = contentType == null ? "png" : contentType.substring(contentType.indexOf('/') + 1);
        if (ext.equals("jpeg")) ext = "jpg";

        Long userId = Long.parseLong(String.valueOf(StpUtil.getLoginId()));
        String filename = userId + "_" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + ext;

        try {
            Path avatarDir = Paths.get(uploadDir, "avatar").toAbsolutePath().normalize();
            Files.createDirectories(avatarDir);
            Path target = avatarDir.resolve(filename).normalize();
            // 防止路径穿越
            if (!target.startsWith(avatarDir)) {
                throw new IllegalArgumentException("非法路径");
            }
            file.transferTo(target.toFile());

            // 更新用户 avatar 字段为可访问 URL
            String url = "/uploads/avatar/" + filename;
            SysUser user = authService.updateProfile(null, url);
            return Result.ok(Map.of("url", url, "avatar", user.getAvatar() == null ? url : user.getAvatar()));
        } catch (IOException e) {
            throw new RuntimeException("文件保存失败: " + e.getMessage());
        }
    }
}
