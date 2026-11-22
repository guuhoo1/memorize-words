package com.example.memorize.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SentencePatternRequest {
    @NotBlank(message = "句型模板不能为空")
    @Size(max = 256, message = "句型模板过长")
    private String pattern;

    @NotBlank(message = "英文例句不能为空")
    private String english;

    @NotBlank(message = "中文翻译不能为空")
    @Size(max = 256, message = "中文翻译过长")
    private String chinese;

    private String explanation;

    @Size(max = 32, message = "分类过长")
    private String category;

    private String tags;

    private Long sourceDialogueId;
}
