package com.example.memorize.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 兼容三种 tags 输入：
 * 1) 数组  ["a", "b"]
 * 2) 字符串 "单个标签"
 * 3) 逗号分隔 "a, b, c"
 */
public class FlexibleTagListDeserializer extends JsonDeserializer<List<String>> {

    @Override
    public List<String> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        return parse(node);
    }

    static List<String> parse(JsonNode node) {
        if (node == null || node.isNull()) {
            return new ArrayList<>();
        }
        if (node.isArray()) {
            List<String> out = new ArrayList<>(node.size());
            for (JsonNode n : node) {
                String s = n.asText();
                if (s != null && !s.isBlank()) out.add(s.trim());
            }
            return out;
        }
        if (node.isTextual()) {
            String raw = node.asText();
            if (raw == null || raw.isBlank()) return new ArrayList<>();
            // 逗号分隔也拆开
            String[] parts = raw.split(",");
            List<String> out = new ArrayList<>(parts.length);
            for (String s : parts) {
                String t = s.trim();
                if (!t.isEmpty()) out.add(t);
            }
            return out;
        }
        return new ArrayList<>();
    }
}
