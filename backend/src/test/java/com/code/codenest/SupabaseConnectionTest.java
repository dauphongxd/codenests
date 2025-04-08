package com.code.codenest;

import com.code.codenest.model.Author;
import com.code.codenest.repository.AuthorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class to verify Supabase PostgreSQL connection
 * Run this test to confirm your database connection is working properly
 */
@SpringBootTest
@ActiveProfiles("test")
public class SupabaseConnectionTest {

    // Using constructor injection instead of field injection to avoid IDE warnings
    private final DataSource dataSource;
    private final AuthorRepository authorRepository;

    // Constructor-based dependency injection
    public SupabaseConnectionTest(DataSource dataSource, AuthorRepository authorRepository) {
        this.dataSource = dataSource;
        this.authorRepository = authorRepository;
    }

    /**
     * Test 1: Verify basic connection to the database
     * This test checks if we can establish a connection and get database metadata
     */
    @Test
    public void testDatabaseConnection() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            assertTrue(connection.isValid(1000));

            DatabaseMetaData metaData = connection.getMetaData();
            String dbName = metaData.getDatabaseProductName();
            String dbVersion = metaData.getDatabaseProductVersion();

            System.out.println("=== Database Connection Test ===");
            System.out.println("Connected to: " + dbName + " version " + dbVersion);
            System.out.println("Connection valid: " + connection.isValid(1000));
            System.out.println("Connection URL: " + metaData.getURL());
            System.out.println("Connection user: " + metaData.getUserName());
            System.out.println("==============================");

            assertEquals("PostgreSQL", dbName);
        }
    }

    /**
     * Test 2: Verify JPA repository operations
     * This test checks if we can perform CRUD operations using JPA
     */
    @Test
    public void testJpaRepositoryOperations() {
        // 1. Create a test author
        String testName = "Test_" + UUID.randomUUID().toString().substring(0, 8);
        String testEmail = testName.toLowerCase() + "@test.com";

        Author testAuthor = new Author();
        testAuthor.setName(testName);
        testAuthor.setEmail(testEmail);
        testAuthor.setPassword("securePassword123");

        // 2. Save the author
        Author savedAuthor = authorRepository.save(testAuthor);
        assertNotNull(savedAuthor.getUuid());

        // 3. Retrieve the author
        Optional<Author> retrievedAuthor = authorRepository.findByEmail(testEmail);
        assertTrue(retrievedAuthor.isPresent());
        assertEquals(testName, retrievedAuthor.get().getName());

        // 4. Delete the author
        authorRepository.delete(savedAuthor);
        assertFalse(authorRepository.findByEmail(testEmail).isPresent());

        System.out.println("=== JPA Repository Test ===");
        System.out.println("Created, retrieved, and deleted test author: " + testName);
        System.out.println("============================");
    }

    /**
     * Simpler test that just checks if we can count authors in the database
     */
    @Test
    public void testSimpleRepositoryOperation() {
        long count = authorRepository.count();
        System.out.println("Number of authors in database: " + count);
        // The test passes as long as the query executes without exception
        assertTrue(true);
    }
}