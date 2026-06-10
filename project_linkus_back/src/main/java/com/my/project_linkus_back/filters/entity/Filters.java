package com.my.project_linkus_back.filters.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Filters {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
