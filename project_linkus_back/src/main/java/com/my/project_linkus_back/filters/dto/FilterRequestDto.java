package com.my.project_linkus_back.filters.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FilterRequestDto {
    //등록할 금지어
    private String word;
}