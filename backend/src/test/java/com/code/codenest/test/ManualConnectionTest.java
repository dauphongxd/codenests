package com.code.codenest.test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Simple database connection tester with corrected Supabase URL format
 * Place this in src/main/java/com/code/codenest
 * Run it as a standard Java application
 */
public class ManualConnectionTest {

    // Corrected Supabase connection details
    // Based on: postgresql://postgres.fwdfrmgfmqtgwqzcvhfl:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres
    private static final String HOST = "aws-0-us-east-2.pooler.supabase.com";
    private static final String PORT = "5432";
    private static final String DATABASE = "postgres";
    private static final String USERNAME = "postgres.fwdfrmgfmqtgwqzcvhfl"; // Note: includes project reference
    private static final String PASSWORD = "[Password]"; // REPLACE THIS

    // Construct JDBC URL
    private static final String DB_URL =
            "jdbc:postgresql://" + HOST + ":" + PORT + "/" + DATABASE + "?sslmode=require";

    public static void main(String[] args) {
        try {
            System.out.println("================================================");
            System.out.println("TESTING CONNECTION TO SUPABASE POSTGRESQL");
            System.out.println("================================================");
            System.out.println("Connecting to: " + DB_URL);
            System.out.println("Username: " + USERNAME);

            // Register JDBC driver
            Class.forName("org.postgresql.Driver");

            // Open a connection
            Connection conn = null;
            try {
                System.out.println("Attempting to connect...");
                conn = DriverManager.getConnection(DB_URL, USERNAME, PASSWORD);

                System.out.println("✅ CONNECTION SUCCESSFUL!");

                // Execute a simple query
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT version()");

                if (rs.next()) {
                    System.out.println("\nPostgreSQL version: " + rs.getString(1));
                }

                // Try to check if tables exist
                try {
                    ResultSet tables = stmt.executeQuery(
                            "SELECT table_name FROM information_schema.tables " +
                                    "WHERE table_schema='public'"
                    );

                    System.out.println("\nExisting tables:");
                    boolean hasAnyTables = false;

                    while (tables.next()) {
                        hasAnyTables = true;
                        System.out.println("- " + tables.getString(1));
                    }

                    if (!hasAnyTables) {
                        System.out.println("No tables found in the public schema.");
                    }
                } catch (Exception e) {
                    System.out.println("Could not retrieve table list: " + e.getMessage());
                }

                // Close resources
                rs.close();
                stmt.close();
                conn.close();
            } catch (Exception e) {
                System.err.println("❌ CONNECTION FAILED!");
                System.err.println("Error message: " + e.getMessage());
                e.printStackTrace();
            } finally {
                try {
                    if (conn != null) conn.close();
                } catch (Exception e) { /* ignore */ }
            }

            System.out.println("\n================================================");
            System.out.println("TEST COMPLETED");
            System.out.println("================================================");
        } catch (Exception e) {
            System.err.println("Failed to initialize test: " + e.getMessage());
            e.printStackTrace();
        }
    }
}