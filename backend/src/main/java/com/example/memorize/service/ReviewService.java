package com.example.memorize.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.common.UserUtil;
import com.example.memorize.dto.ReviewSubmitRequest;
import com.example.memorize.entity.ReviewRecord;
import com.example.memorize.entity.Word;
import com.example.memorize.mapper.ReviewRecordMapper;
import com.example.memorize.mapper.WordMapper;
import com.example.memorize.util.Sm2Algorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final WordMapper wordMapper;
    private final ReviewRecordMapper reviewRecordMapper;

    public List<Word> dueWords() {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<Word> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Word::getUserId, uid)
               .and(w -> w.isNull(Word::getNextReview).or().le(Word::getNextReview, LocalDateTime.now()))
               .orderByAsc(Word::getNextReview);
        return wordMapper.selectList(wrapper);
    }

    public Word submitReview(ReviewSubmitRequest req) {
        int grade = req.getGrade();
        if (grade != 0 && grade != 2 && grade != 4 && grade != 5) {
            throw new IllegalArgumentException("评分值非法，只能是 0/2/4/5");
        }

        Word word = wordMapper.selectById(req.getWordId());
        if (word == null) throw new IllegalArgumentException("单词不存在");
        if (!word.getUserId().equals(UserUtil.currentUserId())) {
            throw new IllegalArgumentException("无权操作");
        }

        // 跑 SM-2
        Sm2Algorithm.Result r = Sm2Algorithm.calculate(
                word.getEaseFactor() == null ? 2.5 : word.getEaseFactor(),
                word.getRepetitions() == null ? 0 : word.getRepetitions(),
                grade
        );

        LocalDateTime now = LocalDateTime.now();
        word.setEaseFactor(r.easeFactor());
        word.setIntervalDays(r.intervalDays());
        word.setRepetitions(r.repetitions());
        word.setLastReview(now);
        if (r.intervalDays() == 0) {
            word.setNextReview(now); // 立即复习
        } else {
            word.setNextReview(now.plusDays(r.intervalDays()));
        }
        wordMapper.updateById(word);

        // 写复习历史
        ReviewRecord record = new ReviewRecord();
        record.setUserId(UserUtil.currentUserId());
        record.setWordId(word.getId());
        record.setGrade(grade);
        record.setReviewedAt(now);
        reviewRecordMapper.insert(record);

        return word;
    }

    public List<ReviewRecord> history(Long wordId) {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<ReviewRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReviewRecord::getUserId, uid);
        if (wordId != null) wrapper.eq(ReviewRecord::getWordId, wordId);
        wrapper.orderByDesc(ReviewRecord::getReviewedAt);
        return reviewRecordMapper.selectList(wrapper);
    }
}
