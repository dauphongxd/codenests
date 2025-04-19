package com.code.codenest.repository;

import com.code.codenest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUuid(String uuid);
    Optional<User> findByUsername(String username);

    default User getByUuid(String uuid) {
        return findByUuid(uuid).orElse(User.UNKNOWN);
    }
}

