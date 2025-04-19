package com.code.codenest.dto;

import com.code.codenest.model.User;

public class UserResponse {
    private String uuid;
    private String username;
    private String email;
    private String personal;
    private String github;
    private String linkedin;

    public UserResponse(User user) {
        this.uuid = user.getUuid();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.personal = user.getPersonal();
        this.github = user.getGithub();
        this.linkedin = user.getLinkedin();
    }

    public String getUuid() {
        return uuid;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPersonal() {
        return personal;
    }

    public String getGithub() {
        return github;
    }

    public String getLinkedin() {
        return linkedin;
    }
}