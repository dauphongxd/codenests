package com.code.codenest.repository;

import com.code.codenest.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByUserId(Long userId);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    long countByGroupId(Long groupId);

    @Transactional
    void deleteByGroupIdAndUserId(Long groupId, Long userId);
}