package com.code.codenest.dto;

public class UserUpdateRequest {
    private String username;
    private String email;
    private String personal;
    private String github;
    private String linkedin;

    // --- Getters ---
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPersonal() { return personal; }
    public String getGithub() { return github; }
    public String getLinkedin() { return linkedin; }

    // --- Setters ---
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPersonal(String personal) { this.personal = personal; }
    public void setGithub(String github) { this.github = github; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
}