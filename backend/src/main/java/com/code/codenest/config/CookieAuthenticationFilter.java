package com.code.codenest.config;

import com.code.codenest.model.User;
import com.code.codenest.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component // Make it a Spring bean
public class CookieAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(CookieAuthenticationFilter.class);
    private final UserRepository userRepository;

    @Autowired
    public CookieAuthenticationFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Optional<String> uuidCookie = extractUuidCookie(request);

        if (uuidCookie.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
            String uuid = uuidCookie.get();
            log.trace("Found uuid cookie: {}", uuid); // Use trace for potentially sensitive info

            Optional<User> userOptional = userRepository.findByUuid(uuid);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                log.debug("Authenticating user '{}' via uuid cookie", user.getUsername());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        null
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("User '{}' authenticated successfully via cookie.", user.getUsername());
            } else {
                log.warn("Invalid uuid cookie found: {}", uuid);
            }
        } else {
            if (uuidCookie.isEmpty()) {
                log.trace("No uuid cookie found for path: {}", request.getRequestURI());
            } else {
                log.trace("SecurityContext already has Authentication for path: {}", request.getRequestURI());
            }
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> extractUuidCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(cookie -> "uuid".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }
}