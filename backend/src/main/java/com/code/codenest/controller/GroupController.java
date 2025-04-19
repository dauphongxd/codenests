package com.code.codenest.controller;

import com.code.codenest.dto.GroupCreateRequest;
import com.code.codenest.model.Group;
import com.code.codenest.model.GroupMember;
import com.code.codenest.model.User;
import com.code.codenest.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.code.codenest.model.GroupSnip;
import com.code.codenest.model.Snip;
import com.code.codenest.dto.SnipResponse;


import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
    private static final Logger logger = LoggerFactory.getLogger(GroupController.class);

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupSnipRepository groupSnipRepository;
    private final SnipRepository snipRepository;
    private final SnipTagRepository snipTagRepository; // Added this

    @Autowired
    public GroupController(
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository,
            GroupSnipRepository groupSnipRepository,
            SnipRepository snipRepository,
            SnipTagRepository snipTagRepository) { // Added this
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.groupSnipRepository = groupSnipRepository;
        this.snipRepository = snipRepository;
        this.snipTagRepository = snipTagRepository; // Added this
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createGroup(
            @RequestBody GroupCreateRequest request,
            @CookieValue(name = "uuid", defaultValue = "") String creatorUuid) {

        if (creatorUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User creator = userRepository.findByUuid(creatorUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        Group group = new Group();
        group.setName(request.getName());
        group.setCreatorId(creator.getId());

        Group savedGroup = groupRepository.save(group);

        // Add creator as a member
        GroupMember member = new GroupMember();
        member.setGroup(savedGroup);
        member.setUserId(creator.getId());
        groupMemberRepository.save(member);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "groupId", savedGroup.getId(),
                "name", savedGroup.getName()
        ));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<Map<String, Object>> addMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> payload,
            @CookieValue(name = "uuid", defaultValue = "") String adminUuid) {

        if (adminUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User admin = userRepository.findByUuid(adminUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Check if user is admin of the group
        if (!group.getCreatorId().equals(admin.getId())) {
            logger.warn("User {} attempted to add member to group {} but is not creator.", admin.getId(), groupId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Only group creator can add members"));
        }

        // --- Find user by email ---
        String emailToAdd = payload.get("email");
        if (emailToAdd == null || emailToAdd.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email is required to add a member"));
        }

        Optional<User> userToAddOptional = userRepository.findByEmail(emailToAdd.trim());
        if (userToAddOptional.isEmpty()) {
            logger.info("Attempted to add non-existent user with email {} to group {}", emailToAdd, groupId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User with email '" + emailToAdd + "' not found"));
        }

        User userToAdd = userToAddOptional.get();
        Long userIdToAdd = userToAdd.getId();

        // Check if user is already a member
        if (groupMemberRepository.findByGroupIdAndUserId(groupId, userIdToAdd).isPresent()) {
            logger.info("Attempted to add user {} (email {}) to group {} but they are already a member.", userIdToAdd, emailToAdd, groupId);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User is already a member of this group"));
        }

        // Add the user to the group
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUserId(userIdToAdd); // Use the found ID
        groupMemberRepository.save(member);

        logger.info("User {} (email {}) added to group {} by admin {}", userIdToAdd, emailToAdd, groupId, admin.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User added to the group"
        ));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Map<String, Object>> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @CookieValue(name = "uuid", defaultValue = "") String adminUuid) {

        if (adminUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User admin = userRepository.findByUuid(adminUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Check if user is admin of the group
        if (!group.getCreatorId().equals(admin.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Only group creator can remove members"));
        }

        // Cannot remove the creator
        if (group.getCreatorId().equals(userId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Cannot remove the group creator"));
        }

        // Find the membership to delete
        Optional<GroupMember> memberToRemove = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (memberToRemove.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User is not a member of this group"));
        }

        // Remove the user from the group
        groupMemberRepository.delete(memberToRemove.get());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User removed from the group"
        ));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<Map<String, Object>> getMembers(
            @PathVariable Long groupId,
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Check if user is a member of the group OR the creator
        boolean isMember = groupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).isPresent();
        boolean isCreator = group.getCreatorId().equals(user.getId());

        if (!isMember && !isCreator) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "You are not a member or creator of this group"));
        }

        // Get all members
        List<Map<String, Object>> members = groupMemberRepository.findByGroupId(groupId)
                .stream()
                .map(member -> {
                    // Use orElse(User.UNKNOWN) for robustness if a user linked to a member gets deleted somehow
                    User memberUser = userRepository.findById(member.getUserId()).orElse(User.UNKNOWN);

                    Map<String, Object> memberMap = new HashMap<>();
                    memberMap.put("id", memberUser.getId()); // Include ID
                    memberMap.put("username", memberUser.getUsername());
                    memberMap.put("uuid", memberUser.getUuid()); // Include UUID if useful for frontend
                    memberMap.put("joinedAt", member.getJoinedAt());
                    memberMap.put("isCreator", memberUser.getId().equals(group.getCreatorId())); // Check creator status

                    return memberMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "groupId", group.getId(),
                "groupName", group.getName(),
                "members", members
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyGroups(
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        // Get groups created by user
        List<Map<String, Object>> createdGroups = groupRepository.findByCreatorId(user.getId())
                .stream()
                .map(group -> {
                    Map<String, Object> groupMap = new HashMap<>();
                    groupMap.put("id", group.getId());
                    groupMap.put("name", group.getName());
                    groupMap.put("createdAt", group.getCreatedAt());
                    groupMap.put("memberCount", groupMemberRepository.countByGroupId(group.getId())); // More efficient count
                    groupMap.put("role", "creator");

                    return groupMap;
                })
                .collect(Collectors.toList());

        // Get groups where user is a member (excluding ones they created)
        List<Map<String, Object>> memberGroups = groupMemberRepository.findByUserId(user.getId())
                .stream()
                .filter(member -> !member.getGroup().getCreatorId().equals(user.getId())) // Filter out groups they created
                .map(member -> {
                    Group group = member.getGroup();

                    Map<String, Object> groupMap = new HashMap<>();
                    groupMap.put("id", group.getId());
                    groupMap.put("name", group.getName());
                    groupMap.put("createdAt", group.getCreatedAt());
                    groupMap.put("memberCount", groupMemberRepository.countByGroupId(group.getId())); // More efficient count
                    groupMap.put("joinedAt", member.getJoinedAt());
                    groupMap.put("role", "member");

                    return groupMap;
                })
                .collect(Collectors.toList());

        // Combine the lists
        List<Map<String, Object>> allGroups = new ArrayList<>(createdGroups);
        allGroups.addAll(memberGroups);

        // Optionally sort the combined list, e.g., by name or creation date
        allGroups.sort(Comparator.comparing(g -> (String) g.get("name")));


        return ResponseEntity.ok(Map.of(
                "success", true,
                "groups", allGroups
        ));
    }

    @GetMapping("/{groupId}/snippets")
    public ResponseEntity<Map<String, Object>> getGroupSnippets(
            @PathVariable Long groupId,
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Check if user is a member of the group OR the creator
        boolean isMember = groupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).isPresent();
        boolean isCreator = group.getCreatorId().equals(user.getId());

        if (!isMember && !isCreator) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "You are not a member of this group"));
        }

        // Get all shared snippets for this group
        List<GroupSnip> groupSnips = groupSnipRepository.findByGroupIdWithSnips(groupId);



        List<Map<String, Object>> accessibleSnippetResponses = new ArrayList<>();

        for (GroupSnip groupSnip : groupSnips) {
            Snip snip = groupSnip.getSnip();

            if (snip.isAccessible()) {
                User author = userRepository.findById(snip.getUserId()).orElse(User.UNKNOWN);
                User sharer = userRepository.findById(groupSnip.getSharedById()).orElse(User.UNKNOWN);

                List<String> tags = snipTagRepository.findBySnipId(snip.getId())
                        .stream()
                        .map(st -> st.getTag().getName())
                        .collect(Collectors.toList());

                Map<String, Object> snippetResponse = new HashMap<>();
                snippetResponse.put("id", snip.getId());
                snippetResponse.put("uuid", snip.getUuid());
                snippetResponse.put("title", snip.getTitle() != null ? snip.getTitle() : "Untitled Snippet");
                snippetResponse.put("createdAt", snip.getCreatedAt().toString());

                Map<String, Object> authorMap = new HashMap<>();
                authorMap.put("id", author.getId());
                authorMap.put("uuid", author.getUuid());
                authorMap.put("username", author.getUsername());

                Map<String, Object> sharerMap = new HashMap<>();
                sharerMap.put("id", sharer.getId());
                sharerMap.put("uuid", sharer.getUuid());
                sharerMap.put("username", sharer.getUsername());

                snippetResponse.put("author", authorMap);
                snippetResponse.put("sharedBy", sharerMap);
                snippetResponse.put("sharedAt", groupSnip.getSharedAt().toString());
                snippetResponse.put("tags", tags);

                accessibleSnippetResponses.add(snippetResponse); // Add to the filtered list
            } else {
                // Optional: Log that an expired snippet was skipped
                logger.debug("Skipping expired/inaccessible snippet UUID {} (ID {}) shared in group {}", snip.getUuid(), snip.getId(), groupId);
            }
            // *** END FILTERING STEP ***
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "snippets", accessibleSnippetResponses // Return the filtered list
        ));
    }

    @PostMapping("/{groupId}/snippets")
    public ResponseEntity<Map<String, Object>> shareSnippet(
            @PathVariable Long groupId,
            @RequestBody Map<String, Object> payload, // Keep receiving a generic map
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // --- Check membership (keep this logic) ---
        boolean isMember = groupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).isPresent();
        boolean isCreator = group.getCreatorId().equals(user.getId());
        if (!isMember && !isCreator) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "You are not a member of this group"));
        }

        // --- Get snippet UUID from request ---
        String snippetUuid = null;
        if (payload.containsKey("snippetUuid")) { // <-- Change key check to snippetUuid
            Object uuidObj = payload.get("snippetUuid");
            if (uuidObj instanceof String) {
                snippetUuid = (String) uuidObj;
            }
        }

        if (snippetUuid == null || snippetUuid.trim().isEmpty()) { // <-- Check for null/empty UUID
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Snippet UUID is required")); // <-- Update error message
        }

        // --- Check if the snippet exists and is accessible using UUID ---
        Snip snippet = snipRepository.findByUuid(snippetUuid) // <-- Find by UUID
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Snippet not found"));

        // --- Get the numeric ID for internal checks ---
        Long snippetId = snippet.getId(); // <-- Get ID after finding by UUID

        // --- Make sure the snippet belongs to the user or is accessible (keep this logic) ---
        if (!snippet.getUserId().equals(user.getId()) && !snippet.isAccessible()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "You cannot share this snippet"));
        }

        // --- Check if snippet is already shared with the group (use numeric ID here) ---
        if (groupSnipRepository.findByGroupIdAndSnipId(groupId, snippetId).isPresent()) { // <-- Use numeric ID for this check
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Snippet is already shared with this group"
            ));
        }

        // --- Create the group-snippet relationship (keep this logic) ---
        GroupSnip groupSnip = new GroupSnip();
        groupSnip.setGroup(group);
        groupSnip.setSnip(snippet); // Pass the found Snip object
        groupSnip.setSharedById(user.getId());
        groupSnip.setSharedAt(LocalDateTime.now());

        groupSnipRepository.save(groupSnip);

        logger.info("Snippet UUID {} (ID {}) shared to group {} by user {}", snippetUuid, snippetId, groupId, user.getId()); // Add logging
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Snippet shared successfully"
        ));
    }
}