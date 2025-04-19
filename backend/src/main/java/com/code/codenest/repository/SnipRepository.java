package com.code.codenest.repository;

import com.code.codenest.model.Snip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SnipRepository extends JpaRepository<Snip, Long> {
    Optional<Snip> findByUuid(String uuid);

    @Query("SELECT s FROM Snip s WHERE s.isDeleted = false ORDER BY s.createdAt DESC") // Use createdAt or id
    List<Snip> findTop10ByOrderByCreatedAtDesc();

    default List<Snip> findLatest10() {
        return findTop10ByOrderByCreatedAtDesc();
    }

    List<Snip> findByUserIdOrderByIdDesc(Long userId);
}

