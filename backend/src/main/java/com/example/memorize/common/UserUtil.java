package com.example.memorize.common;

import cn.dev33.satoken.stp.StpUtil;

/**
 * 当前登录用户工具
 */
public class UserUtil {

    public static Long currentUserId() {
        Object id = StpUtil.getLoginId();
        return Long.parseLong(String.valueOf(id));
    }
}
