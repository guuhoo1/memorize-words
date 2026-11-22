package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.dto.SentencePatternRequest;
import com.example.memorize.entity.SentencePattern;
import com.example.memorize.service.SentencePatternService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sentence-patterns")
@RequiredArgsConstructor
public class SentencePatternController {

    private final SentencePatternService sentencePatternService;

    @GetMapping
    public Result<List<SentencePattern>> list(@RequestParam(required = false) String category,
                                              @RequestParam(required = false) String tag) {
        return Result.ok(sentencePatternService.list(category, tag));
    }

    @GetMapping("/{id}")
    public Result<SentencePattern> get(@PathVariable Long id) {
        return Result.ok(sentencePatternService.getById(id));
    }

    @PostMapping
    public Result<SentencePattern> create(@Valid @RequestBody SentencePatternRequest req) {
        return Result.ok(sentencePatternService.create(req));
    }

    @PutMapping("/{id}")
    public Result<SentencePattern> update(@PathVariable Long id, @Valid @RequestBody SentencePatternRequest req) {
        return Result.ok(sentencePatternService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sentencePatternService.delete(id);
        return Result.ok();
    }

    @GetMapping("/categories")
    public Result<List<String>> categories() {
        return Result.ok(sentencePatternService.listCategories());
    }
}
