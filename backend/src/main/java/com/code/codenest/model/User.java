package com.code.codenest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"id"})
public class User {
    @Transient
    public static final User UNKNOWN = new User("00000000-0000-0000-0000-000000000000", "Unknown");
    static {
        UNKNOWN.username = "Unknown";
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid = UUID.randomUUID().toString();

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    private String personal;
    private String github;
    private String linkedin;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
    }

    public User(String uuid, String username) {
        this.uuid = uuid;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getUuid() {
        return uuid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonIgnore
    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean checkPassword(String password) {
        return getHexStringFromByteArray(getPasswordHashArray(password)).equals(passwordHash);
    }

    public void setPassword(String password) {
        this.passwordHash = getHexStringFromByteArray(getPasswordHashArray(password));
    }

    // For backward compatibility
    public String getName() {
        return username;
    }

    // For backward compatibility
    public void setName(String name) {
        this.username = name;
    }

    public String getPersonal() {
        return personal;
    }

    public void setPersonal(String personal) {
        this.personal = personal;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return uuid.equals(user.uuid);
    }

    @Override
    public int hashCode() {
        return uuid.hashCode();
    }

    private String getHexStringFromByteArray(byte[] array) {
        return new BigInteger(1, array).toString(16);
    }

    private byte[] getPasswordHashArray(String password) {
        try {
            return MessageDigest.getInstance("SHA3-512").digest(password.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException ignored) {
            return new byte[0];
        }
    }
}