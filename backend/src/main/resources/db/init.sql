-- memorize-words 建库 SQL
-- 手动执行：mysql -u memorize_words -pmemorize_words123 memorize_words < init.sql

CREATE TABLE IF NOT EXISTS sys_user (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(64)  NOT NULL UNIQUE,
  password_hash   VARCHAR(128) NOT NULL,
  nickname        VARCHAR(64),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '用户';

CREATE TABLE IF NOT EXISTS word (
  id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT       NOT NULL,
  english             VARCHAR(128) NOT NULL,
  chinese             VARCHAR(256) NOT NULL,
  phonetic            VARCHAR(128),
  example             TEXT,
  tags                VARCHAR(512) DEFAULT '',
  ease_factor         DOUBLE       NOT NULL DEFAULT 2.5,
  interval_days       INT          NOT NULL DEFAULT 0,
  repetitions         INT          NOT NULL DEFAULT 0,
  next_review         DATETIME,
  last_review         DATETIME,
  source_dialogue_id  BIGINT,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_word_user_id (user_id),
  INDEX idx_word_next_review (next_review),
  CONSTRAINT fk_word_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
) COMMENT '单词';

CREATE TABLE IF NOT EXISTS dialogue (
  id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT       NOT NULL,
  title       VARCHAR(256) NOT NULL,
  source      VARCHAR(256),
  category    VARCHAR(32)  NOT NULL,
  content     TEXT         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dialogue_user_id (user_id),
  CONSTRAINT fk_dialogue_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
) COMMENT '对话素材';

CREATE TABLE IF NOT EXISTS review_record (
  id          BIGINT   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT   NOT NULL,
  word_id     BIGINT   NOT NULL,
  grade       INT      NOT NULL,
  reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_review_word_id (word_id),
  INDEX idx_review_user_id (user_id),
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_word FOREIGN KEY (word_id) REFERENCES word(id) ON DELETE CASCADE
) COMMENT '复习历史';
