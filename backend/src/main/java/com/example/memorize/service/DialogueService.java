package com.example.memorize.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.memorize.common.UserUtil;
import com.example.memorize.dto.DialogueCreateRequest;
import com.example.memorize.entity.Dialogue;
import com.example.memorize.mapper.DialogueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DialogueService {

    private final DialogueMapper dialogueMapper;

    public Dialogue create(DialogueCreateRequest req) {
        Dialogue d = new Dialogue();
        d.setUserId(UserUtil.currentUserId());
        d.setTitle(req.getTitle().trim());
        d.setSource(req.getSource());
        d.setCategory(req.getCategory().trim());
        d.setContent(req.getContent());
        dialogueMapper.insert(d);
        return d;
    }

    public Dialogue update(Long id, DialogueCreateRequest req) {
        Dialogue d = requireOwnDialogue(id);
        d.setTitle(req.getTitle().trim());
        d.setSource(req.getSource());
        d.setCategory(req.getCategory().trim());
        d.setContent(req.getContent());
        dialogueMapper.updateById(d);
        return d;
    }

    public void delete(Long id) {
        Dialogue d = requireOwnDialogue(id);
        dialogueMapper.deleteById(d.getId());
    }

    public Dialogue getById(Long id) {
        return requireOwnDialogue(id);
    }

    public List<Dialogue> list(String category) {
        Long uid = UserUtil.currentUserId();
        LambdaQueryWrapper<Dialogue> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Dialogue::getUserId, uid).orderByDesc(Dialogue::getUpdatedAt);
        if (StringUtils.hasText(category)) {
            wrapper.eq(Dialogue::getCategory, category.trim());
        }
        return dialogueMapper.selectList(wrapper);
    }

    private Dialogue requireOwnDialogue(Long id) {
        Dialogue d = dialogueMapper.selectById(id);
        if (d == null) throw new IllegalArgumentException("对话不存在");
        if (!d.getUserId().equals(UserUtil.currentUserId())) {
            throw new IllegalArgumentException("无权操作");
        }
        return d;
    }
}
