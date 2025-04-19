package com.code.codenest.repository;

import com.code.codenest.model.ViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViewLogRepository extends JpaRepository<ViewLog, Long> {
    List<ViewLog> findBySnipId(Long snipId);
    List<ViewLog> findByViewerId(Long viewerId);
}