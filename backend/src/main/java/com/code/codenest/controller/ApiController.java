package com.code.codenest.controller;

import com.code.codenest.dto.SnipCreateRequest;
import com.code.codenest.dto.SnipResponse;
import com.code.codenest.dto.UserResponse;
import com.code.codenest.exception.SnippetNotFoundException;
import com.code.codenest.model.*;
import com.code.codenest.repository.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.code.codenest.dto.SnipResponse;
import com.code.codenest.dto.UserResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.code.codenest.dto.UserUpdateRequest;

import java.util.stream.Collectors;
import java.util.Collections;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    public static final HttpHeaders RESPONSE_HEADERS = new HttpHeaders();

    static {
        RESPONSE_HEADERS.setContentType(MediaType.valueOf("application/json; charset=UTF-8"));
    }

    private final UserRepository userRepository;
    private final SnipRepository snipRepository;
    private final TagRepository tagRepository;
    private final SnipTagRepository snipTagRepository;
    private final ViewLogRepository viewLogRepository;
    private final ExpirationLogRepository expirationLogRepository;

    @Autowired
    private ApiController(
            UserRepository userRepo,
            SnipRepository snipRepo,
            TagRepository tagRepo,
            SnipTagRepository snipTagRepo,
            ViewLogRepository viewLogRepo,
            ExpirationLogRepository expirationLogRepo) {
        this.userRepository = userRepo;
        this.snipRepository = snipRepo;
        this.tagRepository = tagRepo;
        this.snipTagRepository = snipTagRepo;
        this.viewLogRepository = viewLogRepo;
        this.expirationLogRepository = expirationLogRepo;
    }

    @PutMapping("/user/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody UserUpdateRequest request,
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication session."));

        boolean updated = false;

        // Update username if provided and different
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty() && !request.getUsername().trim().equals(user.getUsername())) {
            // Check if username is already taken by another user
            Optional<User> existingUser = userRepository.findByUsername(request.getUsername().trim());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username already taken"));
            }
            user.setUsername(request.getUsername().trim());
            updated = true;
            logger.info("Updating username for user {}", user.getId());
        }

        // Update email if provided and different
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().trim().equalsIgnoreCase(user.getEmail())) {
            String newEmail = request.getEmail().trim();
            // Check if email is already taken by another user
            Optional<User> existingUser = userRepository.findByEmail(newEmail);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered by another user"));
            }
            user.setEmail(newEmail);
            updated = true;
            logger.info("Updating email for user {}", user.getId());
        }

        // Update optional fields (allow setting to null or empty)
        if (request.getPersonal() != null && !request.getPersonal().equals(user.getPersonal())) {
            user.setPersonal(request.getPersonal().trim().isEmpty() ? null : request.getPersonal().trim());
            updated = true;
            logger.info("Updating personal link for user {}", user.getId());
        }
        if (request.getGithub() != null && !request.getGithub().equals(user.getGithub())) {
            user.setGithub(request.getGithub().trim().isEmpty() ? null : request.getGithub().trim());
            updated = true;
            logger.info("Updating github link for user {}", user.getId());
        }
        if (request.getLinkedin() != null && !request.getLinkedin().equals(user.getLinkedin())) {
            user.setLinkedin(request.getLinkedin().trim().isEmpty() ? null : request.getLinkedin().trim());
            updated = true;
            logger.info("Updating linkedin link for user {}", user.getId());
        }


        if (updated) {
            User savedUser = userRepository.save(user);
            logger.info("User {} profile updated successfully.", savedUser.getId());
            // Return updated user data
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", new UserResponse(savedUser) // Return updated user info
            ));
        } else {
            logger.info("No changes detected for user {} profile update.", user.getId());
            return ResponseEntity.ok(Map.of("success", true, "message", "No changes detected"));
        }
    }

    @GetMapping("/user/snippets")
    public ResponseEntity<Map<String, Object>> getUserSnippets(
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        if (userUuid.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication session."));

        List<Snip> userSnips = snipRepository.findByUserIdOrderByIdDesc(user.getId());

        if (userSnips.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", true, "snippets", Collections.emptyList()));
        }

        UserResponse authorResponse = new UserResponse(user); // Author is always the current user

        List<SnipResponse> snipResponses = userSnips.stream()
                .map(snip -> {
                    // Get tags for this snip
                    List<String> tags = snipTagRepository.findBySnipId(snip.getId())
                            .stream()
                            .map(st -> st.getTag().getName())
                            .collect(Collectors.toList());

                    boolean isAccessible = snip.isAccessible(); // Calculate beforehand

                    // Create the response object
                    SnipResponse responseDto = new SnipResponse(snip, authorResponse, tags);

                    // *** ENSURE isAccessible is set (redundant if constructor is reliable) ***
//                    responseDto.setAccessible(isAccessible); // SnipResponse needs a setter if you use this line

                    return responseDto; // Return the DTO created by the constructor
                })
                .collect(Collectors.toList());


        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("snippets", snipResponses);
        // No need to return separate "authors" list as it's always the same user

        return ResponseEntity.ok(response);
    }

    @PostMapping("code/new")
    public ResponseEntity<?> createSnippet(
            @RequestBody SnipCreateRequest request,
            @CookieValue(name = "uuid", defaultValue = "") String userUuid) {

        // --- Get User from Cookie ---
        if (userUuid.isEmpty()) {
            logger.warn("Attempt to create snippet without authentication cookie.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required to create snippet."));
        }

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> {
                    logger.error("Authenticated user UUID {} not found in database.", userUuid);
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication session.");
                });
        logger.info("Received request to /api/code/new");
        logger.info("Request DTO content: [{}]", request.getContent());
        logger.info("Request Expiration Type: {}, Value: {}", request.getExpirationType(), request.getExpirationValue()); // Log received values

        Snip newSnippet = new Snip();
        newSnippet.setTitle(request.getTitle());
        newSnippet.setContent(request.getContent());
        newSnippet.setUserId(user.getId());

        newSnippet.setExpirationType(request.getExpirationType()); // Set type (can be null)
        newSnippet.setExpirationValue(request.getExpirationValue()); // Set value (can be 0)
        logger.info("Setting Snip Entity Expiration Type: {}, Value: {}", newSnippet.getExpirationType(), newSnippet.getExpirationValue());
        // --- END CORRECTION ---

        Snip savedSnippet = snipRepository.save(newSnippet);

        // Process tags if present
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            logger.info("Processing tags: {}", request.getTags());
            for (String tagName : request.getTags()) {
                if (tagName == null || tagName.trim().isEmpty()) {
                    logger.warn("Skipping empty or null tag name.");
                    continue;
                }
                String cleanTagName = tagName.trim();
                Tag tag = tagRepository.findByName(cleanTagName)
                        .orElseGet(() -> {
                            logger.info("Tag '{}' not found, creating new tag.", cleanTagName);
                            Tag newTag = new Tag();
                            newTag.setName(cleanTagName);
                            return tagRepository.save(newTag);
                        });

                SnipTag snipTag = new SnipTag();
                snipTag.setSnip(savedSnippet);
                snipTag.setTag(tag);
                snipTagRepository.save(snipTag);
            }
        } else {
            logger.info("No tags provided in request.");
        }

        logger.debug("Created snippet via /api/code/new with UUID: {}", savedSnippet.getUuid());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("uuid", savedSnippet.getUuid());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    ResponseEntity<Map<String, Object>> createUser(@RequestBody User user, HttpServletResponse response) {
        try {
            // Validate the user data
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
            }

            // Check if email already exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
            }

            // Check if username already exists
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username already taken"));
            }

            var saved = userRepository.save(user);

            // Set the cookie for automatic login
            var cookie = new Cookie("uuid", saved.getUuid());
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(1_166_000); // Default to remember
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", saved.getId(),
                    "uuid", saved.getUuid(),
                    "username", saved.getUsername(),
                    "email", saved.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody BaseCredentials credentials, HttpServletResponse response) {
        logger.debug("Login attempt for email: {}", credentials.getEmail());

        var optUser = userRepository.findByEmail(credentials.getEmail());

        if (optUser.isPresent()) {
            var user = optUser.get();

            if (user.checkPassword(credentials.getPassword())) {
                logger.info("Successful login for user: {}", user.getEmail());

                // Make sure cookie name is explicitly set
                Cookie cookie = new Cookie("uuid", user.getUuid());
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                cookie.setMaxAge(credentials.isRemember() ? 1_166_000 : 360);
                response.addCookie(cookie);
                logger.debug("Auth cookie set for user: {}", user.getUuid());

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "uuid", user.getUuid(),
                        "username", user.getUsername(),
                        "email", user.getEmail()
                ));
            }
        }

        logger.warn("Failed login attempt for email: {}", credentials.getEmail());
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid email or password"));
    }

    @PostMapping("/logout")
    ResponseEntity<Map<String, Boolean>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("uuid", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<?> getCurrentUser(@CookieValue(name = "uuid", defaultValue = "") String uuid) {
        logger.debug("Auth check for UUID: {}", uuid);

        if (uuid.isEmpty()) {
            logger.warn("Auth check failed: No UUID cookie present");
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        Optional<User> optUser = userRepository.findByUuid(uuid);
        if (optUser.isPresent()) {
            User user = optUser.get();
            logger.debug("Auth check successful for user: {}", user.getUsername());
            return ResponseEntity.ok(Map.of(
                    "uuid", user.getUuid(),
                    "username", user.getUsername(),
                    "email", user.getEmail()
            ));
        }

        logger.warn("Auth check failed: Invalid UUID - {}", uuid);
        return ResponseEntity.status(401).body(Map.of("message", "Invalid authentication"));
    }

    @GetMapping("/code/latest")
    ResponseEntity<Map<String, Object>> getLatest10AsJson() {
        List<Snip> snippetList = snipRepository.findLatest10();

        List<UserResponse> authorResponses = new ArrayList<>();
        List<SnipResponse> snipResponses = new ArrayList<>();

        for (Snip snip : snippetList) {
            User user = userRepository.findById(snip.getUserId())
                    .orElse(User.UNKNOWN);

            List<String> tags = snipTagRepository.findBySnipId(snip.getId())
                    .stream()
                    .map(st -> st.getTag().getName())
                    .collect(Collectors.toList());

            UserResponse userResponse = new UserResponse(user);
            SnipResponse snipResponse = new SnipResponse(snip, userResponse, tags);

            authorResponses.add(userResponse);
            snipResponses.add(snipResponse);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("snippets", snipResponses);
        response.put("authors", authorResponses);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{uuid}")
    ResponseEntity<Map<String, Object>> getByIdAsJson(
            @PathVariable String uuid,
            @RequestParam(required = false, defaultValue = "false") boolean skipIncrement,
            @CookieValue(name = "uuid", required = false) String userUuid) {

        logger.debug("Get snippet by UUID: {}, skipIncrement: {}", uuid, skipIncrement);

        var optionalSnippet = snipRepository.findByUuid(uuid);

        if (optionalSnippet.isPresent()) {
            var snip = optionalSnippet.get();

            if (snip.isAccessible()) {
                // Only increment view count if we're not skipping
                if (!skipIncrement) {
                    snip.increaseViewCount();
                    snip = snipRepository.save(snip);
                    logger.debug("Incremented view count for snippet: {}, new count: {}",
                            uuid, snip.getViewCount());

                    // Create view log if user is authenticated
                    if (userUuid != null && !userUuid.isEmpty()) {
                        User viewer = userRepository.findByUuid(userUuid).orElse(null);
                        if (viewer != null) {
                            ViewLog viewLog = new ViewLog();
                            viewLog.setSnip(snip);
                            viewLog.setViewerId(viewer.getId());
                            viewLogRepository.save(viewLog);
                        }
                    }

                    // Check if snippet expired due to views
                    if ("VIEWS".equals(snip.getExpirationType()) &&
                            snip.getViewCount() >= snip.getExpirationValue()) {
                        ExpirationLog expLog = new ExpirationLog();
                        expLog.setSnipId(snip.getId());
                        expLog.setExpirationReason("VIEWS");
                        expirationLogRepository.save(expLog);
                    }
                } else {
                    logger.debug("Skipped incrementing view count for snippet: {}", uuid);
                }

                User author = userRepository.findById(snip.getUserId())
                        .orElse(User.UNKNOWN);

                // Get tags for this snip
                List<String> tags = snipTagRepository.findBySnipId(snip.getId())
                        .stream()
                        .map(st -> st.getTag().getName())
                        .collect(Collectors.toList());

                UserResponse authorResponse = new UserResponse(author);
                SnipResponse snipResponse = new SnipResponse(snip, authorResponse, tags);

                Map<String, Object> response = new HashMap<>();
                response.put("snippet", snipResponse);
                response.put("author", authorResponse);
                response.put("tags", tags);

                return ResponseEntity.ok(response);
            } else {
                logger.debug("Snippet not accessible: {}", uuid);
                return ResponseEntity.status(403).body(Map.of(
                        "message", "The code snippet has expired.",
                        "expired", true
                ));
            }
        }

        logger.debug("Snippet not found: {}", uuid);
        return ResponseEntity.status(404).body(Map.of("message", "No such code snippet"));
    }

    @GetMapping("/debug/cookies")
    public ResponseEntity<Map<String, Object>> debugCookies(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Get all cookies
        Cookie[] cookies = request.getCookies();
        Map<String, String> cookieMap = new HashMap<>();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                cookieMap.put(cookie.getName(), cookie.getValue());
            }
            response.put("cookies", cookieMap);
            response.put("cookieCount", cookies.length);
        } else {
            response.put("cookies", "No cookies found");
            response.put("cookieCount", 0);
        }

        // Get all headers
        Map<String, String> headerMap = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headerMap.put(headerName, request.getHeader(headerName));
        }
        response.put("headers", headerMap);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/debug/snippet/{uuid}")
    public ResponseEntity<Map<String, Object>> debugSnippet(@PathVariable String uuid) {
        var optionalCodeSnippet = snipRepository.findByUuid(uuid);

        if (optionalCodeSnippet.isPresent()) {
            var snippet = optionalCodeSnippet.get();

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("uuid", snippet.getUuid());
            debugInfo.put("title", snippet.getTitle());
            debugInfo.put("userId", snippet.getUserId());
            debugInfo.put("expirationType", snippet.getExpirationType());
            debugInfo.put("expirationValue", snippet.getExpirationValue());
            debugInfo.put("creationDate", snippet.getCreatedAt());
            debugInfo.put("currentServerTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("uuuu/MM/dd HH:mm:ss")));
            debugInfo.put("isTimeRestricted", "TIME".equals(snippet.getExpirationType()));
            debugInfo.put("remainingSeconds", snippet.getRemainingSeconds());
            debugInfo.put("isExpired", !snippet.isAccessible());
            debugInfo.put("viewCount", snippet.getViewCount());
            debugInfo.put("isViewRestricted", "VIEWS".equals(snippet.getExpirationType()));
            debugInfo.put("isDeleted", snippet.isDeleted());

            // Tags
            List<String> tags = snipTagRepository.findBySnipId(snippet.getId())
                    .stream()
                    .map(st -> st.getTag().getName())
                    .collect(Collectors.toList());
            debugInfo.put("tags", tags);

            // View logs
            List<Map<String, Object>> viewLogs = viewLogRepository.findBySnipId(snippet.getId())
                    .stream()
                    .map(vl -> {
                        Map<String, Object> logInfo = new HashMap<>();
                        logInfo.put("id", vl.getId());
                        logInfo.put("viewerId", vl.getViewerId());
                        logInfo.put("viewedAt", vl.getViewedAt());
                        return logInfo;
                    })
                    .collect(Collectors.toList());
            debugInfo.put("viewLogs", viewLogs);

            return ResponseEntity.ok(debugInfo);
        }

        return ResponseEntity.notFound().build();
    }
}
