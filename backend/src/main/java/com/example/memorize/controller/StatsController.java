package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/dashboard")
    public Result<Map<String, Long>> dashboard() {
        return Result.ok(statsService.dashboard());
    }
}
