package com.example.memorize.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.common.UserUtil;
import com.example.memorize.entity.DictItem;
import com.example.memorize.mapper.DictItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DictService {

    private final DictItemMapper mapper;

    public List<DictItem> list(String dictType) {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<DictItem> w = new LambdaQueryWrapper<>();
        w.eq(DictItem::getUserId, uid).eq(DictItem::getDictType, dictType).orderByAsc(DictItem::getSortOrder);
        return mapper.selectList(w);
    }

    @Transactional
    public List<DictItem> listAll() {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<DictItem> w = new LambdaQueryWrapper<>();
        w.eq(DictItem::getUserId, uid).orderByAsc(DictItem::getDictType).orderByAsc(DictItem::getSortOrder);
        return mapper.selectList(w);
    }

    @Transactional
    public DictItem create(String dictType, String itemLabel, Integer sortOrder) {
        Long uid = UserUtil.currentUserId();
        // 重复检查
        LambdaQueryWrapper<DictItem> w = new LambdaQueryWrapper<>();
        w.eq(DictItem::getUserId, uid).eq(DictItem::getDictType, dictType).eq(DictItem::getItemLabel, itemLabel);
        if (mapper.selectCount(w) > 0) {
            throw new IllegalArgumentException("该字典项已存在");
        }
        DictItem item = new DictItem();
        item.setUserId(uid);
        item.setDictType(dictType);
        item.setItemLabel(itemLabel);
        item.setSortOrder(sortOrder == null ? 0 : sortOrder);
        mapper.insert(item);
        return item;
    }

    @Transactional
    public DictItem update(Long id, String itemLabel, Integer sortOrder) {
        Long uid = UserUtil.currentUserId();
        DictItem item = mapper.selectById(id);
        if (item == null || !item.getUserId().equals(uid)) {
            throw new IllegalArgumentException("字典项不存在");
        }
        if (itemLabel != null) item.setItemLabel(itemLabel);
        if (sortOrder != null) item.setSortOrder(sortOrder);
        mapper.updateById(item);
        return item;
    }

    @Transactional
    public void delete(Long id) {
        Long uid = UserUtil.currentUserId();
        DictItem item = mapper.selectById(id);
        if (item == null || !item.getUserId().equals(uid)) {
            throw new IllegalArgumentException("字典项不存在");
        }
        mapper.deleteById(id);
    }
}
