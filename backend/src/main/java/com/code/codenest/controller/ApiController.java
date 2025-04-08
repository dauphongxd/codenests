package com.code.codenest.controller;

import com.code.codenest.model.Author;
import com.code.codenest.model.BaseCredentials;
import com.code.codenest.model.CodeSnippet;
import com.code.codenest.exception.SnippetNotFoundException;
import com.code.codenest.repository.AuthorRepository;
import com.code.codenest.repository.CodeSnippetRepository;
import com.code.codenest.dto.SnippetCreateRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    public static final HttpHeaders RESPONSE_HEADERS = new HttpHeaders();

    static {
        RESPONSE_HEADERS.setContentType(MediaType.valueOf("application/json; charset=UTF-8"));
    }

    private final AuthorRepository authorRepository;
    private final CodeSnippetRepository codeSnippetRepository;

    @Autowired
    private ApiController(AuthorRepository authorRepo, CodeSnippetRepository codeRepo) {
        this.authorRepository = authorRepo;
        this.codeSnippetRepository = codeRepo;
    }

    @PostMapping("code/new")
    public ResponseEntity<?> createSnippet(@RequestBody SnippetCreateRequest request) {

        // Find author by name (Ensure findByName was added to AuthorRepository)
        Author author = authorRepository.findByName(request.getAuthorName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format("Author '%s' not found.", request.getAuthorName())));

        CodeSnippet newSnippet = new CodeSnippet();
        newSnippet.setCode(request.getCode());
        newSnippet.setAuthorUuid(author.getUuid());
        newSnippet.setTimeLimit(request.getTime_restriction()); // Ensure this uses plusSeconds
        newSnippet.setViewLimit(request.getView_restriction());

        CodeSnippet savedSnippet = codeSnippetRepository.save(newSnippet);

        logger.debug("Created snippet via /api/code/new with UUID: {}", savedSnippet.getUuid());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("uuid", savedSnippet.getUuid());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    ResponseEntity<Map<String, Object>> createAuthor(@RequestBody Author author, HttpServletResponse response) {
        try {
            // Validate the author data
            if (author.getEmail() == null || author.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
            }

            // Check if email already exists
            if (authorRepository.findByEmail(author.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
            }

            var saved = authorRepository.save(author);

            // Set the cookie for automatic login
            var cookie = new Cookie("uuid", saved.getUuid());
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(1_166_000); // Default to remember
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", saved.getUuid(),
                    "uuid", saved.getUuid(),
                    "name", saved.getName(),
                    "email", saved.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody BaseCredentials credentials, HttpServletResponse response) {
        logger.debug("Login attempt for email: {}", credentials.getEmail());

        var optAuthor = authorRepository.findByEmail(credentials.getEmail());

        if (optAuthor.isPresent()) {
            var author = optAuthor.get();

            if (author.checkPassword(credentials.getPassword())) {
                logger.info("Successful login for user: {}", author.getEmail());

                // Make sure cookie name is explicitly set
                Cookie cookie = new Cookie("uuid", author.getUuid());
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                cookie.setMaxAge(credentials.isRemember() ? 1_166_000 : 360);
                response.addCookie(cookie);
                logger.debug("Auth cookie set for user: {}", author.getUuid());

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "uuid", author.getUuid(),
                        "name", author.getName(),
                        "email", author.getEmail()
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

        Optional<Author> optAuthor = authorRepository.findByUuid(uuid);
        if (optAuthor.isPresent()) {
            Author author = optAuthor.get();
            logger.debug("Auth check successful for user: {}", author.getName());
            return ResponseEntity.ok(Map.of(
                    "uuid", author.getUuid(),
                    "name", author.getName(),
                    "email", author.getEmail()
            ));
        }

        logger.warn("Auth check failed: Invalid UUID - {}", uuid);
        return ResponseEntity.status(401).body(Map.of("message", "Invalid authentication"));
    }

    @GetMapping("/code/latest")
    ResponseEntity<Map<String, Object>> getLatest10AsJson() {
        List<CodeSnippet> snippetList = codeSnippetRepository.findLatest10();
        List<Author> authorList = snippetList.stream()
                .map(CodeSnippet::getAuthorUuid)
                .map(authorRepository::getByUuid)
                .toList();

        snippetList.forEach(CodeSnippet::increaseViewCount);
        codeSnippetRepository.saveAll(snippetList);

        Map<String, Object> response = new HashMap<>();
        response.put("snippets", snippetList);
        response.put("authors", authorList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{uuid}")
    ResponseEntity<Map<String, Object>> getByIdAsJson(
            @PathVariable String uuid,
            @RequestParam(required = false, defaultValue = "false") boolean skipIncrement) {

        logger.debug("Get snippet by UUID: {}, skipIncrement: {}", uuid, skipIncrement);

        var optionalCodeSnippet = codeSnippetRepository.findByUuid(uuid);

        if (optionalCodeSnippet.isPresent()) {
            var codeSnippet = optionalCodeSnippet.get();

            if (codeSnippet.isAccessible()) {
                // Only increment view count if we're not skipping
                if (!skipIncrement) {
                    codeSnippet.increaseViewCount();
                    codeSnippet = codeSnippetRepository.save(codeSnippet);
                    logger.debug("Incremented view count for snippet: {}, new count: {}",
                            uuid, codeSnippet.getViewCount());
                } else {
                    logger.debug("Skipped incrementing view count for snippet: {}", uuid);
                }

                Author author = authorRepository.getByUuid(codeSnippet.getAuthorUuid());

                Map<String, Object> response = new HashMap<>();
                response.put("snippet", codeSnippet);
                response.put("author", author);

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
        var optionalCodeSnippet = codeSnippetRepository.findByUuid(uuid);

        if (optionalCodeSnippet.isPresent()) {
            var snippet = optionalCodeSnippet.get();

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("uuid", snippet.getUuid());
            debugInfo.put("timeLimit", snippet.getTimeLimit());
            debugInfo.put("creationDate", snippet.getDate());
            debugInfo.put("expiryDate", snippet.getExpiryDate());
            debugInfo.put("currentServerTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("uuuu/MM/dd HH:mm:ss")));
            debugInfo.put("isTimeRestricted", snippet.isRestrictedByTime());
            debugInfo.put("remainingSeconds", snippet.getRemainingSeconds());
            debugInfo.put("isExpired", !snippet.isAccessible());
            debugInfo.put("viewLimit", snippet.getViewLimit());
            debugInfo.put("viewCount", snippet.getViewCount());
            debugInfo.put("isViewRestricted", snippet.isRestrictedByViews());

            return ResponseEntity.ok(debugInfo);
        }

        return ResponseEntity.notFound().build();
    }
}
