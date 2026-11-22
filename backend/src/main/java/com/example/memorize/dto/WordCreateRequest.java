package com.example.memorize.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class WordCreateRequest {
    @NotBlank(message = "英文不能为空")
    private String english;

    @NotBlank(message = "中文不能为空")
    private String chinese;

    private String phonetic;
    private String example;
    private List<String> tags;
    private Long sourceDialogueId;
}
