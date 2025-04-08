package com.code.codenest.repository;

import com.code.codenest.model.Author;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorRepository extends CrudRepository<Author, Long> {
    Optional<Author> findByEmail(String email);
    Optional<Author> findByUuid(String uuid);
    Optional<Author> findByName(String name);

    default Author getByUuid(String uuid) {
        return findByUuid(uuid).orElse(Author.UNKNOWN);
    }
}
