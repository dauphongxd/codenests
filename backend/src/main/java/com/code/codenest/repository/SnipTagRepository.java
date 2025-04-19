package com.code.codenest.repository;

import com.code.codenest.model.SnipTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SnipTagRepository extends JpaRepository<SnipTag, Long> {
    List<SnipTag> findBySnipId(Long snipId);
    List<SnipTag> findByTagId(Long tagId);
    void deleteBySnipIdAndTagId(Long snipId, Long tagId);
}