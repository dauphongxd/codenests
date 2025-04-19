package com.code.codenest.controller;

import com.code.codenest.dto.MessageCreateRequest;
import com.code.codenest.model.Message;
import com.code.codenest.model.Snip;
import com.code.codenest.model.User;
import com.code.codenest.repository.MessageRepository;
import com.code.codenest.repository.SnipRepository;
import com.code.codenest.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SnipRepository snipRepository;

    @Autowired
    public MessageController(MessageRepository messageRepository, UserRepository userRepository, SnipRepository snipRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.snipRepository = snipRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMessage(
            @RequestBody MessageCreateRequest request,
            @CookieValue(name = "uuid", defaultValue = "") String senderUuid) {

        if (senderUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User sender = userRepository.findByUuid(senderUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));
        User receiver = null;

        if (request.getReceiverId() != null) {
            // If ID is provided, use it directly
            receiver = userRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient user ID not found"));
        } else if (request.getReceiverEmail() != null && !request.getReceiverEmail().trim().isEmpty()) {
            // If email is provided, look up by email
            Optional<User> receiverOpt = userRepository.findByEmail(request.getReceiverEmail().trim());
            if (receiverOpt.isPresent()) {
                receiver = receiverOpt.get();
            } else {
                logger.info("Attempt to send message to non-existent email: {}", request.getReceiverEmail());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Recipient email not found"));
            }
        } else {
            // If neither ID nor email is provided
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Recipient ID or Email is required"));
        }

        // Prevent sending message to self
        if (sender.getId().equals(receiver.getId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Cannot send messages to yourself"));
        }

        Message message = new Message();
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setContent(request.getContent());

        if (request.getSnipUuid() != null && !request.getSnipUuid().isEmpty()) {
            snipRepository.findByUuid(request.getSnipUuid())
                    .ifPresent(snip -> message.setSnipId(snip.getId()));
        }
        else if (request.getSnipId() != null) {
            message.setSnipId(request.getSnipId());
        }

        Message saved = messageRepository.save(message);
        logger.info("Message {} created from user {} to user {}", saved.getId(), sender.getId(), receiver.getId());
        return ResponseEntity.ok(Map.of("success", true, "messageId", saved.getId()));
    }

    @GetMapping("/inbox")
    public ResponseEntity<Map<String, Object>> getInboxMessages(
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        List<Map<String, Object>> messages = messageRepository.findByReceiverIdOrderBySentAtDesc(user.getId())
                .stream()
                .map(message -> {
                    User sender = userRepository.findById(message.getSenderId()).orElse(User.UNKNOWN);
                    String snipUuid = null;
                    if (message.getSnipId() != null) {
                        snipUuid = snipRepository.findById(message.getSnipId()) // Find by numeric ID
                                .map(Snip::getUuid)            // Map to UUID
                                .orElse(null);                 // Or null if snippet deleted
                    }

                    Map<String, Object> messageMap = new HashMap<>();
                    messageMap.put("id", message.getId());
                    messageMap.put("senderId", message.getSenderId());
                    messageMap.put("senderName", sender.getUsername());
                    messageMap.put("content", message.getContent());
                    messageMap.put("sentAt", message.getSentAt());
                    messageMap.put("snipId", message.getSnipId());
                    messageMap.put("snipUuid", snipUuid);

                    return messageMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "messages", messages));
    }

    @GetMapping("/sent")
    public ResponseEntity<Map<String, Object>> getSentMessages(
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));

        List<Map<String, Object>> messages = messageRepository.findBySenderIdOrderBySentAtDesc(user.getId())
                .stream()
                .map(message -> {
                    User receiver = userRepository.findById(message.getReceiverId()).orElse(User.UNKNOWN);
                    String snipUuid = null;
                    if (message.getSnipId() != null) {
                        snipUuid = snipRepository.findById(message.getSnipId())
                                .map(Snip::getUuid)
                                .orElse(null);
                    }

                    Map<String, Object> messageMap = new HashMap<>();
                    messageMap.put("id", message.getId());
                    messageMap.put("receiverId", message.getReceiverId());
                    messageMap.put("receiverName", receiver.getUsername());
                    messageMap.put("content", message.getContent());
                    messageMap.put("sentAt", message.getSentAt());
                    messageMap.put("snipId", message.getSnipId());
                    messageMap.put("snipUuid", snipUuid);

                    return messageMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "messages", messages));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable Long otherUserId,
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Get messages involving these two users
        List<Message> conversationMessages = messageRepository.findConversation(user.getId(), otherUserId);

        // Combine and sort by sent time
        List<Map<String, Object>> conversation = conversationMessages.stream()
                .map(message -> {
                    String snipUuid = null;
                    if (message.getSnipId() != null) {
                        snipUuid = snipRepository.findById(message.getSnipId())
                                .map(Snip::getUuid)
                                .orElse(null);
                    }

                    Map<String, Object> messageMap = new HashMap<>();
                    messageMap.put("id", message.getId());
                    messageMap.put("senderId", message.getSenderId());
                    messageMap.put("receiverId", message.getReceiverId());
                    messageMap.put("content", message.getContent());
                    messageMap.put("sentAt", message.getSentAt());
                    messageMap.put("direction", message.getSenderId().equals(user.getId()) ? "sent" : "received");
                    messageMap.put("snipId", message.getSnipId());
                    messageMap.put("snipUuid", snipUuid); // *** Add snipUuid to response ***

                    return messageMap;
                })
                .sorted(Comparator.comparing(m -> (LocalDateTime) m.get("sentAt")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "otherUser", Map.of("id", otherUser.getId(), "username", otherUser.getUsername(), "uuid", otherUser.getUuid()),
                "messages", conversation
        ));
    }
}