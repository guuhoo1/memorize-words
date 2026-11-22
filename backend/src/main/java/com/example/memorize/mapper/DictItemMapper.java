package com.example.memorize.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.memorize.entity.DictItem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DictItemMapper extends BaseMapper<DictItem> {
}
