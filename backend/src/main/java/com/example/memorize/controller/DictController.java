package com.example.memorize.controller;

import com.example.memorize.common.Result;
import com.example.memorize.entity.DictItem;
import com.example.memorize.service.DictService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dicts")
@RequiredArgsConstructor
public class DictController {

    private final DictService dictService;

    /** 按类型查字典项，如 GET /api/dicts?type=dialogue_category */
    @GetMapping
    public Result<List<DictItem>> list(@RequestParam String type) {
        return Result.ok(dictService.list(type));
    }

    /** 查当前用户所有字典（按 dict_type 分组） */
    @GetMapping("/all")
    public Result<List<DictItem>> listAll() {
        return Result.ok(dictService.listAll());
    }

    @PostMapping
    public Result<DictItem> create(@RequestBody DictCreateRequest req) {
        return Result.ok(dictService.create(req.type, req.label, req.sortOrder));
    }

    @PutMapping("/{id}")
    public Result<DictItem> update(@PathVariable Long id, @RequestBody DictUpdateRequest req) {
        return Result.ok(dictService.update(id, req.label, req.sortOrder));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        dictService.delete(id);
        return Result.ok();
    }

    /** 字典类型常量（给前端下拉提示用） */
    @GetMapping("/types")
    public Result<String[]> types() {
        return Result.ok(new String[]{"dialogue_category", "word_tag"});
    }

    // ---------- inner DTOs ----------

    public static class DictCreateRequest {
        public String type;       // dict_type
        public String label;      // item_label
        public Integer sortOrder;
    }

    public static class DictUpdateRequest {
        public String label;
        public Integer sortOrder;
    }
}
