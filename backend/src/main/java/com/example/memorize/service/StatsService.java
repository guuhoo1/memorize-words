package com.example.memorize.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.common.UserUtil;
import com.example.memorize.entity.Dialogue;
import com.example.memorize.entity.Word;
import com.example.memorize.mapper.DialogueMapper;
import com.example.memorize.mapper.WordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final WordMapper wordMapper;
    private final DialogueMapper dialogueMapper;

    public Map<String, Long> dashboard() {
        Long uid = UserUtil.currentUserId();
        LocalDateTime now = LocalDateTime.now();

        Long wordCount = wordMapper.selectCount(
                new LambdaQueryWrapper<Word>().eq(Word::getUserId, uid)
        );
        Long dueCount = wordMapper.selectCount(
                new LambdaQueryWrapper<Word>().eq(Word::getUserId, uid)
                        .and(w -> w.isNull(Word::getNextReview).or().le(Word::getNextReview, now))
        );
        Long masteredCount = wordMapper.selectCount(
                new LambdaQueryWrapper<Word>().eq(Word::getUserId, uid)
                        .ge(Word::getRepetitions, 4)
        );
        Long dialogueCount = dialogueMapper.selectCount(
                new LambdaQueryWrapper<Dialogue>().eq(Dialogue::getUserId, uid)
        );

        Map<String, Long> stats = new HashMap<>();
        stats.put("wordCount", wordCount);
        stats.put("dueCount", dueCount);
        stats.put("masteredCount", masteredCount);
        stats.put("dialogueCount", dialogueCount);
        return stats;
    }
}
