package com.example.memorize.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ReviewSubmitRequest {
    @NotNull(message = "单词ID不能为空")
    @Positive(message = "单词ID非法")
    private Long wordId;

    /** 0=Again, 2=Hard, 4=Good, 5=Easy */
    @NotNull(message = "评分不能为空")
    private Integer grade;
}
