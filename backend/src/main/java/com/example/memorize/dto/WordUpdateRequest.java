package com.example.memorize.dto;

import lombok.Data;

import java.util.List;

@Data
public class WordUpdateRequest {
    private String english;
    private String chinese;
    private String phonetic;
    private String example;
    private List<String> tags;
    private Long sourceDialogueId;
}
