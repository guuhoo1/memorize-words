package com.example.memorize.config;

import com.example.memorize.entity.Dialogue;
import com.example.memorize.entity.SysUser;
import com.example.memorize.entity.Word;
import com.example.memorize.mapper.DialogueMapper;
import com.example.memorize.mapper.SysUserMapper;
import com.example.memorize.mapper.WordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

/**
 * 首次启动时灌入 admin 用户 + mock 单词 + mock 对话
 * 仅在 sys_user 表为空时执行（幂等）
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SysUserMapper userMapper;
    private final WordMapper wordMapper;
    private final DialogueMapper dialogueMapper;

    @Value("${app.admin-username:admin}")
    private String adminUsername;

    @Value("${app.admin-password:admin123}")
    private String adminPassword;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        if (userMapper.selectCount(null) > 0) {
            log.info("[DataSeeder] 数据库非空，跳过种子数据");
            return;
        }
        log.info("[DataSeeder] 开始灌入种子数据...");

        SysUser admin = new SysUser();
        admin.setUsername(adminUsername);
        admin.setPasswordHash(encoder.encode(adminPassword));
        admin.setNickname("管理员");
        userMapper.insert(admin);

        LocalDateTime now = LocalDateTime.now();
        Long uid = admin.getId();

        Dialogue d1 = new Dialogue();
        d1.setUserId(uid);
        d1.setTitle("Serendipity 经典对白");
        d1.setSource("电影 Serendipity");
        d1.setCategory("电影/剧集");
        d1.setContent("Jonathan: You know what? Destiny is for losers. I just believe you make your own luck.\nSara: So what do you believe?\nJonathan: I believe in... serendipity. But if it doesn't happen, you know what? You just make an excuse and you go home.");
        dialogueMapper.insert(d1);

        Dialogue d2 = new Dialogue();
        d2.setUserId(uid);
        d2.setTitle("TED: How great leaders inspire action");
        d2.setSource("TED 演讲");
        d2.setCategory("演讲");
        d2.setContent("\"People don't buy what you do; they buy why you do it.\" — Simon Sinek\nEvery organization on the planet knows what they do, some know how they do it, but very few know why they do what they do.");
        dialogueMapper.insert(d2);

        Word[] words = {
                makeWord(uid, "serendipity", "意外发现珍奇事物的运气", "/ˌserənˈdɪpəti/",
                        "Finding that rare book in a second-hand shop was pure serendipity.",
                        "cet6,托福", d1.getId()),
                makeWord(uid, "resilience", "韧性；恢复力", "/rɪˈzɪliəns/",
                        "Her resilience in the face of adversity was remarkable.",
                        "考研,cet6", null),
                makeWord(uid, "ephemeral", "短暂的；瞬息的", "/ɪˈfemərəl/",
                        "The ephemeral beauty of cherry blossoms draws crowds every spring.",
                        "gre,托福", null),
                makeWord(uid, "ubiquitous", "无处不在的", "/juːˈbɪkwɪtəs/",
                        "Smartphones have become ubiquitous in modern life.",
                        "gre,cet6", null),
                makeWord(uid, "catalyst", "催化剂；触发因素", "/ˈkætəlɪst/",
                        "The new policy was a catalyst for economic growth.",
                        "考研,cet6", null),
                makeWord(uid, "eloquent", "雄辩的；有说服力的", "/ˈeləkwənt/",
                        "She gave an eloquent speech that moved the entire audience.",
                        "gre,托福", d2.getId())
        };
        for (Word w : words) wordMapper.insert(w);

        log.info("[DataSeeder] 完成：admin={}，单词={}，对话={}", adminUsername, words.length, 2);
    }

    private Word makeWord(Long uid, String en, String zh, String phon, String ex, String tags, Long srcDialogueId) {
        Word w = new Word();
        w.setUserId(uid);
        w.setEnglish(en);
        w.setChinese(zh);
        w.setPhonetic(phon);
        w.setExample(ex);
        w.setTags(tags);
        w.setEaseFactor(2.5);
        w.setIntervalDays(0);
        w.setRepetitions(0);
        w.setSourceDialogueId(srcDialogueId);
        return w;
    }
}
