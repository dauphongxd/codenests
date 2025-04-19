package com.code.codenest.repository;

import com.code.codenest.model.ExpirationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpirationLogRepository extends JpaRepository<ExpirationLog, Long> {
    List<ExpirationLog> findBySnipId(Long snipId);
}