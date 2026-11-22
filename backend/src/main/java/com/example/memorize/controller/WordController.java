package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.dto.WordCreateRequest;
import com.example.memorize.dto.WordUpdateRequest;
import com.example.memorize.entity.Word;
import com.example.memorize.service.WordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

    @GetMapping
    public Result<List<Word>> list(@RequestParam(required = false) String q,
                                   @RequestParam(required = false) String tag) {
        return Result.ok(wordService.list(q, tag));
    }

    @GetMapping("/{id}")
    public Result<Word> get(@PathVariable Long id) {
        return Result.ok(wordService.getById(id));
    }

    @PostMapping
    public Result<Word> create(@Valid @RequestBody WordCreateRequest req) {
        return Result.ok(wordService.create(req));
    }

    @PutMapping("/{id}")
    public Result<Word> update(@PathVariable Long id, @RequestBody WordUpdateRequest req) {
        return Result.ok(wordService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        wordService.delete(id);
        return Result.ok();
    }

    @GetMapping("/tags")
    public Result<List<String>> tags() {
        return Result.ok(wordService.listTags());
    }
}
