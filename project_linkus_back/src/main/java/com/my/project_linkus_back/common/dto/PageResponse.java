package com.my.project_linkus_back.common.dto;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class PageResponse<T> {
    // 검색한 결과를 담을 DTO List => content
    private List<T> content;
    // 현재 페이지
    private int page;
    // 페이지 당 리스트 수
    private int size;
    // 전체 리스트 수
    private long totalElements;
    // 전체 페이지 수
    private int totalPages;
    // 다음 페이지 여부
    private boolean hasNext;

    // 생성자(페이지를 통으로 넘겨받아서 DTO로 변환)
    public PageResponse(Page<T> page) {
        content = page.getContent();
        this.page = page.getNumber();
        size = page.getSize();
        totalElements = page.getTotalElements();
        totalPages = page.getTotalPages();
        hasNext = page.hasNext();
    }
}
