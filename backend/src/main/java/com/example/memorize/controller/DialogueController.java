package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.dto.DialogueCreateRequest;
import com.example.memorize.entity.Dialogue;
import com.example.memorize.service.DialogueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dialogues")
@RequiredArgsConstructor
public class DialogueController {

    private final DialogueService dialogueService;

    @GetMapping
    public Result<List<Dialogue>> list(@RequestParam(required = false) String category) {
        return Result.ok(dialogueService.list(category));
    }

    @GetMapping("/{id}")
    public Result<Dialogue> get(@PathVariable Long id) {
        return Result.ok(dialogueService.getById(id));
    }

    @PostMapping
    public Result<Dialogue> create(@Valid @RequestBody DialogueCreateRequest req) {
        return Result.ok(dialogueService.create(req));
    }

    @PutMapping("/{id}")
    public Result<Dialogue> update(@PathVariable Long id, @Valid @RequestBody DialogueCreateRequest req) {
        return Result.ok(dialogueService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        dialogueService.delete(id);
        return Result.ok();
    }
}
