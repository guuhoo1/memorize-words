package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.dto.ReviewSubmitRequest;
import com.example.memorize.entity.ReviewRecord;
import com.example.memorize.entity.Word;
import com.example.memorize.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/due")
    public Result<List<Word>> due() {
        return Result.ok(reviewService.dueWords());
    }

    @PostMapping("/submit")
    public Result<Word> submit(@Valid @RequestBody ReviewSubmitRequest req) {
        return Result.ok(reviewService.submitReview(req));
    }

    @GetMapping("/history")
    public Result<List<ReviewRecord>> history(@RequestParam(required = false) Long wordId) {
        return Result.ok(reviewService.history(wordId));
    }
}
