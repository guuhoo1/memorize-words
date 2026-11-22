package com.example.memorize.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.common.UserUtil;
import com.example.memorize.dto.SentencePatternRequest;
import com.example.memorize.entity.SentencePattern;
import com.example.memorize.mapper.SentencePatternMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SentencePatternService {

    private final SentencePatternMapper sentencePatternMapper;

    public SentencePattern create(SentencePatternRequest req) {
        SentencePattern sp = new SentencePattern();
        sp.setUserId(UserUtil.currentUserId());
        sp.setPattern(req.getPattern().trim());
        sp.setEnglish(req.getEnglish());
        sp.setChinese(req.getChinese().trim());
        sp.setExplanation(req.getExplanation());
        sp.setCategory(StringUtils.hasText(req.getCategory()) ? req.getCategory().trim() : "未分类");
        sp.setTags(req.getTags());
        sp.setSourceDialogueId(req.getSourceDialogueId());
        sentencePatternMapper.insert(sp);
        return sp;
    }

    public SentencePattern update(Long id, SentencePatternRequest req) {
        SentencePattern sp = requireOwn(id);
        sp.setPattern(req.getPattern().trim());
        sp.setEnglish(req.getEnglish());
        sp.setChinese(req.getChinese().trim());
        sp.setExplanation(req.getExplanation());
        sp.setCategory(StringUtils.hasText(req.getCategory()) ? req.getCategory().trim() : "未分类");
        sp.setTags(req.getTags());
        sp.setSourceDialogueId(req.getSourceDialogueId());
        sentencePatternMapper.updateById(sp);
        return sp;
    }

    public void delete(Long id) {
        SentencePattern sp = requireOwn(id);
        sentencePatternMapper.deleteById(sp.getId());
    }

    public SentencePattern getById(Long id) {
        return requireOwn(id);
    }

    public List<SentencePattern> list(String category, String tag) {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<SentencePattern> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SentencePattern::getUserId, uid).orderByDesc(SentencePattern::getUpdatedAt);
        if (StringUtils.hasText(category)) {
            wrapper.eq(SentencePattern::getCategory, category.trim());
        }
        if (StringUtils.hasText(tag)) {
            wrapper.like(SentencePattern::getTags, tag.trim());
        }
        return sentencePatternMapper.selectList(wrapper);
    }

    public List<String> listCategories() {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<SentencePattern> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SentencePattern::getUserId, uid).select(SentencePattern::getCategory).isNotNull(SentencePattern::getCategory);
        return sentencePatternMapper.selectList(wrapper).stream()
                .map(SentencePattern::getCategory).distinct().toList();
    }

    private SentencePattern requireOwn(Long id) {
        SentencePattern sp = sentencePatternMapper.selectById(id);
        if (sp == null) throw new IllegalArgumentException("句型不存在");
        if (!sp.getUserId().equals(UserUtil.currentUserId())) {
            throw new IllegalArgumentException("无权操作");
        }
        return sp;
    }
}
