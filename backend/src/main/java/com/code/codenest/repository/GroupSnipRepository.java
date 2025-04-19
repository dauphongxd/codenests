package com.code.codenest.repository;

import com.code.codenest.model.GroupSnip;
import com.code.codenest.model.Snip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupSnipRepository extends JpaRepository<GroupSnip, Long> {
    // Find all snippets shared with a group
    List<GroupSnip> findByGroupId(Long groupId);

    // Find all groups a snippet is shared with
    List<GroupSnip> findBySnipId(Long snipId);

    // Check if a specific snippet is already shared with a group
    Optional<GroupSnip> findByGroupIdAndSnipId(Long groupId, Long snippetId);

    // Get snippet details for a group with author info
    @Query("SELECT gs FROM GroupSnip gs JOIN FETCH gs.snip s WHERE gs.group.id = :groupId ORDER BY gs.sharedAt DESC")
    List<GroupSnip> findByGroupIdWithSnips(@Param("groupId") Long groupId);
}