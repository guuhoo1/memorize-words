package com.example.memorize.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
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

    /** 兼容数组 / 单个字符串 / 逗号分隔字符串 */
    @JsonDeserialize(using = FlexibleTagListDeserializer.class)
    private List<String> tags;

    private Long sourceDialogueId;
}
