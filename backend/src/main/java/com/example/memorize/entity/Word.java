package com.example.memorize.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("word")
public class Word {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String english;
    private String chinese;
    private String phonetic;
    private String example;
    /** 逗号分隔的标签，如 "cet4,考研" */
    private String tags;
    private Double easeFactor;
    private Integer intervalDays;
    private Integer repetitions;
    private LocalDateTime nextReview;
    private LocalDateTime lastReview;
    private Long sourceDialogueId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
