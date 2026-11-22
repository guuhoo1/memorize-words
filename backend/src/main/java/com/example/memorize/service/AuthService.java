package com.example.memorize.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.dto.LoginRequest;
import com.example.memorize.entity.SysUser;
import com.example.memorize.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public Map<String, Object> login(LoginRequest req) {
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, req.getUsername())
        );
        if (user == null || !encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        StpUtil.login(user.getId());
        Map<String, Object> result = new HashMap<>();
        result.put("token", StpUtil.getTokenValue());
        result.put("user", user);
        return result;
    }

    public SysUser register(LoginRequest req) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, req.getUsername())
        );
        if (count > 0) {
            throw new IllegalArgumentException("用户名已存在");
        }
        SysUser user = new SysUser();
        user.setUsername(req.getUsername());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setNickname(req.getUsername());
        userMapper.insert(user);
        return user;
    }

    public SysUser current() {
        Long id = Long.parseLong(String.valueOf(StpUtil.getLoginId()));
        return userMapper.selectById(id);
    }

    public void logout() {
        StpUtil.logout();
    }

    public SysUser updateProfile(String nickname, String avatar) {
        Long id = Long.parseLong(String.valueOf(StpUtil.getLoginId()));
        SysUser user = userMapper.selectById(id);
        if (nickname != null) user.setNickname(nickname);
        if (avatar != null) user.setAvatar(avatar);
        userMapper.updateById(user);
        // 刷新 token 里的登录态（保持 id）
        StpUtil.login(id);
        return user;
    }
}
