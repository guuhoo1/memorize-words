package com.example.memorize.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.common.UserUtil;
import com.example.memorize.dto.WordCreateRequest;
import com.example.memorize.dto.WordUpdateRequest;
import com.example.memorize.entity.Word;
import com.example.memorize.mapper.WordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WordService {

    private final WordMapper wordMapper;

    public Word create(WordCreateRequest req) {
        Word w = new Word();
        w.setUserId(UserUtil.currentUserId());
        w.setEnglish(req.getEnglish().trim());
        w.setChinese(req.getChinese().trim());
        w.setPhonetic(req.getPhonetic());
        w.setExample(req.getExample());
        w.setTags(joinTags(req.getTags()));
        w.setSourceDialogueId(req.getSourceDialogueId());
        // SM-2 初始值
        w.setEaseFactor(2.5);
        w.setIntervalDays(0);
        w.setRepetitions(0);
        wordMapper.insert(w);
        return w;
    }

    public Word update(Long id, WordUpdateRequest req) {
        Word w = requireOwnWord(id);
        if (req.getEnglish() != null) w.setEnglish(req.getEnglish().trim());
        if (req.getChinese() != null) w.setChinese(req.getChinese().trim());
        if (req.getPhonetic() != null) w.setPhonetic(req.getPhonetic());
        if (req.getExample() != null) w.setExample(req.getExample());
        if (req.getTags() != null) w.setTags(joinTags(req.getTags()));
        if (req.getSourceDialogueId() != null) w.setSourceDialogueId(req.getSourceDialogueId());
        wordMapper.updateById(w);
        return w;
    }

    public void delete(Long id) {
        Word w = requireOwnWord(id);
        wordMapper.deleteById(w.getId());
    }

    public Word getById(Long id) {
        return requireOwnWord(id);
    }

    public List<Word> list(String q, String tag) {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<Word> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Word::getUserId, uid)
               .orderByDesc(Word::getUpdatedAt);

        if (StringUtils.hasText(q)) {
            String like = "%" + q.trim() + "%";
            wrapper.and(w -> w.like(Word::getEnglish, like).or().like(Word::getChinese, like));
        }
        if (StringUtils.hasText(tag)) {
            wrapper.like(Word::getTags, tag.trim());
        }
        return wordMapper.selectList(wrapper);
    }

    /** 返回当前用户所有出现过的 tag 去重列表 */
    public List<String> listTags() {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<Word> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Word::getUserId, uid).select(Word::getTags).isNotNull(Word::getTags);
        List<Word> words = wordMapper.selectList(wrapper);
        Set<String> set = new LinkedHashSet<>();
        for (Word w : words) {
            if (!StringUtils.hasText(w.getTags())) continue;
            for (String t : w.getTags().split(",")) {
                if (StringUtils.hasText(t)) set.add(t.trim());
            }
        }
        return new ArrayList<>(set);
    }

    // ---- helpers ----

    private Word requireOwnWord(Long id) {
        Word w = wordMapper.selectById(id);
        if (w == null) throw new IllegalArgumentException("单词不存在");
        if (!w.getUserId().equals(UserUtil.currentUserId())) {
            throw new IllegalArgumentException("无权操作");
        }
        return w;
    }

    static String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return "";
        return tags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.joining(","));
    }
}
