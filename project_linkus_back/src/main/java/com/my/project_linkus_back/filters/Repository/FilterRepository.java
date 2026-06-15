package com.my.project_linkus_back.filters.Repository;

import com.my.project_linkus_back.filters.entity.Filters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilterRepository extends JpaRepository<Filters, Long> {
    boolean existsByWord(String word);
}
