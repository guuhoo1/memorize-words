package com.example.memorize.config;

import com.example.memorize.entity.Dialogue;
import com.example.memorize.entity.DictItem;
import com.example.memorize.entity.SentencePattern;
import com.example.memorize.entity.SysUser;
import com.example.memorize.entity.Word;
import com.example.memorize.mapper.DialogueMapper;
import com.example.memorize.mapper.DictItemMapper;
import com.example.memorize.mapper.SentencePatternMapper;
import com.example.memorize.mapper.SysUserMapper;
import com.example.memorize.mapper.WordMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * 首次启动时灌入 admin 用户 + mock 单词 + mock 对话 + 默认字典
 * 字典种子幂等：对每个现有用户若字典表为空则灌
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SysUserMapper userMapper;
    private final WordMapper wordMapper;
    private final DialogueMapper dialogueMapper;
    private final DictItemMapper dictMapper;
    private final SentencePatternMapper sentencePatternMapper;

    @Value("${app.admin-username:admin}")
    private String adminUsername;

    @Value("${app.admin-password:admin123}")
    private String adminPassword;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private static final String[] DEFAULT_CATEGORIES = {"电影/剧集", "书籍", "演讲", "日常/工作"};
    private static final String[] DEFAULT_TAGS = {"CET4", "CET6", "雅思", "托福", "GRE", "考研"};

    @Override
    public void run(String... args) {
        long userCount = userMapper.selectCount(null);
        if (userCount == 0) {
            log.info("[DataSeeder] 开始灌入种子数据...");
            seedUserWordsDialogues();
        } else {
            log.info("[DataSeeder] 数据库已存在 {} 用户，跳过种子数据", userCount);
        }
        // 字典对每个现有用户幂等补灌
        seedDictsForAllUsers();
        // 常用句型对每个现有用户幂等补灌
        seedSentencePatternsForAllUsers();
    }

    private void seedUserWordsDialogues() {
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

    private void seedDictsForAllUsers() {
        List<SysUser> users = userMapper.selectList(null);
        for (SysUser u : users) {
            Long uid = u.getId();
            // 字典为空才灌
            long cnt = dictMapper.selectCount(new LambdaQueryWrapper<DictItem>().eq(DictItem::getUserId, uid));
            if (cnt > 0) continue;

            int order = 0;
            for (String c : DEFAULT_CATEGORIES) {
                DictItem d = new DictItem();
                d.setUserId(uid);
                d.setDictType("dialogue_category");
                d.setItemLabel(c);
                d.setSortOrder(order++);
                dictMapper.insert(d);
            }
            order = 0;
            for (String t : DEFAULT_TAGS) {
                DictItem d = new DictItem();
                d.setUserId(uid);
                d.setDictType("word_tag");
                d.setItemLabel(t);
                d.setSortOrder(order++);
                dictMapper.insert(d);
            }
            log.info("[DataSeeder] 用户 {} 字典已灌入 ({} categories + {} tags)", uid, DEFAULT_CATEGORIES.length, DEFAULT_TAGS.length);
        }
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

    private static final String[][] DEFAULT_PATTERNS = {
            // pattern, english, chinese, explanation, category, tags
            {"It is + adj + for sb to do sth", "It is important for us to protect the environment.", "对我们来说保护环境很重要。", "用于描述某事对某人来说具有某种性质。for 后接 sb，to 后接动词原形。", "简单句", "常用,cet4"},
            {"sb + be + adj + to do sth", "I am glad to hear the good news.", "听到这个好消息我很开心。", "用于表达主语做某事时的感受。常用形容词：glad, sorry, surprised, happy, eager 等。", "简单句", "常用,cet4"},
            {"It is + adj + of sb to do sth", "It is very kind of you to help me.", "你帮助我真是太好了。", "用于评价某人做某事的品质。of 后的 sb 通常是品质评价的对象。对比 for：of 侧重人的品性，for 侧重事情的难度。", "简单句", "常用,cet6"},
            {"Not only + 助动词 + 主语 + but (also) + 主语 + 动词", "Not only did he finish the task on time, but he also offered to help others.", "他不仅按时完成了任务，还主动帮助了其他人。", "Not only 放在句首时，前半句要倒装（助动词提前）。后半句不倒装。also 可省略。", "倒装句", "高级句型,grep"},
            {"No sooner had + 主语 + done + than + 主语 + did", "No sooner had she arrived home than it started to rain.", "她刚到家就开始下雨了。", "表示“一…就…”。No sooner 放句首需倒装。than 后用一般过去时，前半句用过去完成时。同义词：Hardly/Scarcely...when/before。", "倒装句", "高级句型,grep"},
            {"Only + 状语 + 助动词 + 主语 + 动词", "Only in this way can we solve the problem effectively.", "只有这样我们才能有效地解决这个问题。", "Only 修饰状语（副词、介词短语、状语从句）时放句首，主句要倒装。Only 修饰主语时不倒装。", "倒装句", "高级句型,cet6"},
            {"It was not until + 时间点 + that + 句子", "It was not until midnight that he finished the report.", "直到午夜他才完成那份报告。", "强调句型的一种，用于强调“直到…才”。not until 放在被强调部分，主句用 that 引导。", "强调句", "高级句型,考研"},
            {"It is/was + 被强调部分 + that/who + 其余部分", "It was Tom who broke the window yesterday.", "昨天打破窗户的是汤姆。", "通用强调句型。被强调部分可以是主语、宾语、状语。强调人可用 who/that，其他一律用 that。", "强调句", "高级句型,cet6"},
            {"The + 比较级 + 主语 + 动词, the + 比较级 + 主语 + 动词", "The more you read, the more you will know.", "你读得越多，知道的就越多。", "表示“越…越…”。前后两个分句都要用比较级。前半句是条件，后半句是结果。", "比较级", "常用,cet4"},
            {"主语 + be + one of the + 最高级 + 复数名词 + (that) + 谓语", "He is one of the best students that I have ever taught.", "他是我教过的最好的学生之一。", "注意：one of + 复数名词，关系代词 that/who 后的谓语通常用复数（因为先行词是复数名词）。", "定语从句", "定语从句,cet6"},
            {"As if / As though + 虚拟语气", "She talks as if she knew everything.", "她说话的样子好像什么都知道似的。", "as if/though 引导的方式状语从句，若与事实相反用虚拟语气：现在相反用过去时(did)，过去相反用过去完成时(had done)。", "虚拟语气", "高级句型,考研"},
            {"if only + 虚拟语气", "If only I were a bird!", "要是我是一只鸟就好了！", "用于表达愿望或遗憾。与现在相反用过去时，与过去相反用过去完成时。常单独成句，主谓倒装。", "虚拟语气", "高级句型,雅思"}
    };

    private void seedSentencePatternsForAllUsers() {
        List<SysUser> users = userMapper.selectList(null);
        for (SysUser u : users) {
            Long uid = u.getId();
            long cnt = sentencePatternMapper.selectCount(
                    new LambdaQueryWrapper<SentencePattern>().eq(SentencePattern::getUserId, uid));
            if (cnt > 0) continue;

            for (String[] row : DEFAULT_PATTERNS) {
                SentencePattern sp = new SentencePattern();
                sp.setUserId(uid);
                sp.setPattern(row[0]);
                sp.setEnglish(row[1]);
                sp.setChinese(row[2]);
                sp.setExplanation(row[3]);
                sp.setCategory(row[4]);
                sp.setTags(row[5]);
                sentencePatternMapper.insert(sp);
            }
            log.info("[DataSeeder] 用户 {} 常用句型已灌入 ({} 条)", uid, DEFAULT_PATTERNS.length);
        }
    }
}
