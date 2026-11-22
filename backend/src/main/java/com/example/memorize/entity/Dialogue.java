package com.example.memorize.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dialogue")
public class Dialogue {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String title;
    private String source;
    /** 电影/剧集 | 书籍 | 演讲 | 日常/工作 */
    private String category;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
