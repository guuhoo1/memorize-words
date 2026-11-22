package com.example.memorize.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户自定义字典项（对话分类 / 单词标签建议等）
 */
@Data
@TableName("sys_dict_item")
public class DictItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** 字典类型：dialogue_category / word_tag / ... */
    private String dictType;

    /** 显示值 */
    private String itemLabel;

    /** 排序 */
    private Integer sortOrder;

    private LocalDateTime createdAt;
}
