package com.example.memorize.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

import java.util.List;

@Data
public class WordUpdateRequest {
    private String english;
    private String chinese;
    private String phonetic;
    private String example;

    @JsonDeserialize(using = FlexibleTagListDeserializer.class)
    private List<String> tags;

    private Long sourceDialogueId;
}
