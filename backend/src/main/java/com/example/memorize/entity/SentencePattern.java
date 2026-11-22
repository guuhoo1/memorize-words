package com.example.memorize.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sentence_pattern")
public class SentencePattern {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    /** 句型模板，如 "It is + adj + for sb to do sth" */
    private String pattern;
    /** 英文例句 */
    private String english;
    /** 中文翻译 */
    private String chinese;
    /** 用法说明 / 注意事项 */
    private String explanation;
    /** 分类：简单句 / 从句 / 时态 / 高级句型 等 */
    private String category;
    /** 逗号分隔标签 */
    private String tags;
    private Long sourceDialogueId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
