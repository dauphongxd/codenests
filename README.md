
# CodeNest: Secure Code Snippet Sharing Platform

CodeNest is a full-stack web application that allows users to create, share, and manage code snippets with fine-grained control over their expiration and accessibility. It features user authentication, snippet creation with time/view limits, tagging, private messaging, and group-based sharing.

## Table of Contents

1.  [Features](#features)
2.  [Tech Stack](#tech-stack)
3.  [Project Architecture](#project-architecture)
    *   [Backend (Spring Boot)](#backend-spring-boot)
    *   [Frontend (React + Vite)](#frontend-react--vite)
    *   [Database (PostgreSQL - Supabase)](#database-postgresql---supabase)
4.  [Directory Structure](#directory-structure)
5.  [Setup and Installation](#setup-and-installation)
    *   [Prerequisites](#prerequisites)
    *   [Backend Setup](#backend-setup)
    *   [Frontend Setup](#frontend-setup)
    *   [Database Setup](#database-setup)
6.  [Running the Application](#running-the-application)
7.  [Environment Variables](#environment-variables)
8.  [Core Functionality & Components](#core-functionality--components)
    *   [Backend Key Components](#backend-key-components)
    *   [Frontend Key Components](#frontend-key-components)
9.  [API Endpoints](#api-endpoints)
10. [Authentication & Authorization](#authentication--authorization)
11. [Database Schema](#database-schema)
12. [Deployment Notes](#deployment-notes)
13. [Future Enhancements](#future-enhancements)

## 1. Features

*   **User Authentication:** Secure user registration and login with cookie-based sessions.
*   **Snippet Creation:**
    *   Create code snippets with titles and content.
    *   Set expiration based on time (e.g., 10 minutes) or number of views.
    *   Add tags to snippets for organization.
*   **Snippet Viewing:**
    *   View public snippets.
    *   View shared snippets within groups.
    *   Snippets automatically become inaccessible after expiration.
    *   View count tracking.
*   **User Profiles:**
    *   Users can update their username, email, and links to personal, GitHub, and LinkedIn profiles.
*   **Private Messaging:**
    *   Send and receive direct messages between users.
    *   Attach code snippets to messages.
    *   View conversations with other users.
*   **Groups:**
    *   Create and manage groups for sharing snippets.
    *   Add/remove members from groups (creator only).
    *   Share snippets with specific groups.
    *   View snippets shared within a group.
*   **Dashboard:**
    *   Overview of user's snippets, recent messages, and groups.
    *   Quick actions for creating new snippets, groups, or messages.
*   **Responsive Frontend:** UI designed with Material UI for a consistent look and feel.

## 2. Tech Stack

*   **Backend:**
    *   Java 21
    *   Spring Boot 3.4
    *   Spring Security (for authentication and authorization)
    *   Spring Data JPA (for database interaction with Hibernate)
    *   PostgreSQL (via Supabase)
    *   Gradle (build tool)
*   **Frontend:**
    *   React 19 (with TypeScript and Vite)
    *   React Router DOM (for client-side routing)
    *   Material UI (for UI components and styling)
    *   Axios (for API calls, though `fetch` is used in `api.js`)
    *   Highlight.js (for code syntax highlighting)
    *   Tailwind CSS (for utility classes, as per `frontend/tailwind.config.js`)
*   **Database:**
    *   PostgreSQL (hosted on Supabase)

## 3. Project Architecture

The application follows a client-server architecture:

### Backend (Spring Boot)
*   **`codenest` (main package):**
    *   **`config`:** Security (`SecurityConfig`, `CookieAuthenticationFilter`) and CORS (`WebConfig`) configurations.
    *   **`controller`:** REST APIs for snippets, users, groups, and messages (`ApiController`, `GroupController`, `MessageController`).
    *   **`dto`:** Data Transfer Objects for request and response payloads.
    *   **`exception`:** Custom exceptions for specific error scenarios (e.g., `SnippetNotFoundException`).
    *   **`model`:** JPA entities representing the database schema (User, Snip, Group, Message, etc.).
    *   **`repository`:** Spring Data JPA repositories for database operations.
*   **RESTful API:** Exposes endpoints for frontend interaction.
*   **Authentication:** Uses a custom `CookieAuthenticationFilter` to authenticate users based on a `uuid` cookie. Spring Security handles authorization.
*   **Database Interaction:** JPA and Hibernate manage persistence to the PostgreSQL database.

### Frontend (React + Vite)
*   **`src` (main source directory):**
    *   **`components`:** Reusable UI components like `Navbar`, `Modal`.
    *   **`contexts`:** `AuthContext` for managing global authentication state.
    *   **`pages`:** Components representing different views/pages of the application (e.g., `HomePage`, `ViewSnippetPage`, `DashboardPage`).
    *   **`services/api.js`:** Centralized module for making API calls to the Spring Boot backend.
    *   **`App.tsx`:** Root component, sets up routing and global theme (Material UI).
    *   **`main.tsx`:** Entry point for the React application.
*   **Client-Side Routing:** `react-router-dom` manages navigation within the single-page application.
*   **State Management:** Primarily uses React's `useState` and `useEffect`, with `AuthContext` for global auth state.
*   **UI:** Material UI provides the component library and styling, with Tailwind CSS potentially used for utility classes.
*   **API Communication:** Uses `fetch` (in `api.js`) to interact with the backend REST API.

### Database (PostgreSQL - Supabase)
*   Hosted PostgreSQL instance on Supabase.
*   Schema includes tables for users, snippets, tags, messages, groups, and related join tables (see `Schema.txt`).
*   JPA entities in the backend map to these tables.

## 4. Directory Structure
├── backend/  
│ ├── gradle/wrapper/  
│ ├── src/main/  
│ │ ├── java/com/code/codenest/ # Core Spring Boot application  
│ │ │ ├── config/  
│ │ │ ├── controller/  
│ │ │ ├── dto/  
│ │ │ ├── exception/  
│ │ │ ├── model/  
│ │ │ └── repository/  
│ │ └── resources/application.properties  
│ ├── build.gradle  
│ └── ... (Gradle files)  
├── frontend/  
│ ├── public/ # Static assets for Vite  
│ ├── src/  
│ │ ├── assets/  
│ │ ├── components/  
│ │ ├── contexts/  
│ │ ├── pages/  
│ │ ├── services/api.js  
│ │ ├── App.css  
│ │ ├── App.tsx  
│ │ ├── index.css  
│ │ └── main.tsx  
│ ├── index.html  
│ ├── package.json  
│ ├── vite.config.ts  
│ └── tailwind.config.js  
├── .gitmodules # Specifies the backend as a submodule  
├── Schema.txt # Database schema definition  
└── README.md # This file

## 5. Setup and Installation

### Prerequisites
*   Java JDK 21 or later
*   Gradle (usually managed by the Gradle wrapper `gradlew`)
*   Node.js (v18 or later recommended) and npm/yarn
*   Supabase Account (for PostgreSQL database)
*   Git (for cloning and submodules)

### Backend Setup (`backend/`)
1.  **Clone the repository with submodules:**
    ```bash
    git clone --recurse-submodules <repository-url>
    cd <repository-directory>/backend
    ```
    If already cloned without submodules, run:
    ```bash
    git submodule update --init --recursive
    ```
2.  **Configure Database:**
    *   Update `backend/src/main/resources/application.properties` with your Supabase PostgreSQL connection details:
        ```properties
        spring.datasource.url=jdbc:postgresql://<your-supabase-host>:<port>/postgres?sslmode=require
        spring.datasource.username=<your-supabase-username>
        spring.datasource.password=<your-supabase-password>
        ```
3.  **Build the project (optional, Spring Boot devtools usually handle this):**
    ```bash
    ./gradlew build
    ```

### Frontend Setup (`frontend/`)
1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend  # From the backend directory, or directly to project_root/frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Vite Proxy Configuration:**
    The `frontend/vite.config.ts` is already configured to proxy `/api` requests to `http://localhost:8080` (the default Spring Boot port). Adjust if your backend runs on a different port.

### Database Setup
1.  Create a new project on [Supabase](https://supabase.com/).
2.  Obtain your PostgreSQL connection string details (host, port, username, password, database name - usually `postgres`).
3.  Use the `Schema.txt` file provided in the repository to create the necessary tables and indexes in your Supabase PostgreSQL database. You can run these SQL commands via the Supabase SQL editor.

## 6. Running the Application

1.  **Start the Backend (Spring Boot):**
    (In the `backend/` directory)
    ```bash
    ./gradlew bootRun
    ```
    The backend server will typically start on `http://localhost:8080`.
2.  **Start the Frontend (React + Vite):**
    (In the `frontend/` directory, open a new terminal)
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend development server will usually start on `http://localhost:5173`.
3.  Open `http://localhost:5173` in your browser.

## 7. Environment Variables

*   **Backend (`backend/src/main/resources/application.properties`):**
    *   `spring.datasource.url`: JDBC URL for your Supabase PostgreSQL database.
    *   `spring.datasource.username`: Your Supabase database username.
    *   `spring.datasource.password`: Your Supabase database password.
*   **Frontend:** No explicit `.env` file is mentioned, but the Vite proxy config in `vite.config.ts` implicitly sets the backend API target.

## 8. Core Functionality & Components

### Backend Key Components
*   **Models (`model/`):** JPA entities like `User`, `Snip`, `Group`, `Message`, `Tag` define the data structure and relationships. `Snip.isAccessible()` contains critical logic for determining if a snippet has expired.
*   **Repositories (`repository/`):** Spring Data JPA interfaces for CRUD operations and custom queries (e.g., `SnipRepository.findLatest10()`, `MessageRepository.findConversation()`).
*   **Controllers (`controller/`):**
    *   `ApiController`: Handles user registration, login/logout, snippet creation/viewing, and profile updates.
    *   `GroupController`: Manages group creation, member addition/removal, and sharing/viewing snippets within groups.
    *   `MessageController`: Handles sending and retrieving private messages and conversations.
*   **Security (`config/`):**
    *   `SecurityConfig`: Configures Spring Security, defining public and protected routes.
    *   `CookieAuthenticationFilter`: Custom filter to authenticate users based on a `uuid` cookie.
*   **DTOs (`dto/`):** Define the structure of data exchanged between frontend and backend.

### Frontend Key Components
*   **`App.tsx`:** Root component, sets up React Router, Material UI ThemeProvider, and AuthProvider.
*   **`AuthContext.jsx`:** Manages global authentication state (current user, loading status) and provides login/logout functions.
*   **Pages (`pages/`):**
    *   `HomePage.jsx`: Landing page for unauthenticated users.
    *   `DashboardPage.jsx`: Main view for authenticated users, showing summaries of snippets, messages, and groups.
    *   `CreateSnippetPage.jsx`: Form for creating new code snippets with expiration options and tags.
    *   `ViewSnippetPage.jsx`: Displays a single code snippet, its details, author information, and handles expiration logic.
    *   `LoginPage.jsx`, `RegisterPage.jsx`: User authentication forms.
    *   `GroupsListPage.jsx`, `CreateGroupPage.jsx`, `GroupDetailPage.jsx`: Components for group management and viewing shared snippets.
    *   `MessagesPage.jsx`, `NewMessagePage.jsx`, `ConversationPage.jsx`: Components for private messaging.
    *   `ProfilePage.jsx`: Allows users to edit their profile information.
*   **`Navbar.jsx`:** Navigation bar, dynamically shows links based on authentication state.
*   **`api.js` (`services/`):** Centralized service for making API calls to the backend.

## 9. API Endpoints

(Refer to `ApiController.java`, `GroupController.java`, `MessageController.java` for a full list. Key endpoints include:)

*   **Authentication:**
    *   `POST /api/register`
    *   `POST /api/login`
    *   `POST /api/logout`
    *   `GET /api/auth/me` (Get current authenticated user)
*   **Snippets:**
    *   `POST /api/code/new`
    *   `GET /api/code/latest`
    *   `GET /api/code/{uuid}`
    *   `GET /api/user/snippets` (Get snippets for the authenticated user)
*   **User Profile:**
    *   `PUT /api/user/profile`
*   **Groups:**
    *   `POST /api/groups` (Create group)
    *   `GET /api/groups/my` (Get groups for the authenticated user)
    *   `GET /api/groups/{groupId}/members`
    *   `POST /api/groups/{groupId}/members` (Add member)
    *   `DELETE /api/groups/{groupId}/members/{userId}` (Remove member)
    *   `GET /api/groups/{groupId}/snippets`
    *   `POST /api/groups/{groupId}/snippets` (Share snippet to group)
*   **Messages:**
    *   `POST /api/messages` (Send message)
    *   `GET /api/messages/inbox`
    *   `GET /api/messages/sent`
    *   `GET /api/messages/conversation/{otherUserId}`
*   **Debug (Examples):**
    *   `GET /api/debug/cookies`
    *   `GET /api/debug/snippet/{uuid}`

## 10. Authentication & Authorization

*   **Authentication:**
    *   Session-based using an HTTP-only cookie named `uuid`.
    *   The `uuid` cookie stores the user's unique identifier.
    *   `CookieAuthenticationFilter` intercepts requests, extracts the `uuid` cookie, and authenticates the user by looking them up in the `UserRepository`.
    *   Login (`/api/login`) sets this cookie upon successful credential validation.
    *   Logout (`/api/logout`) clears this cookie.
*   **Authorization:**
    *   Spring Security (`SecurityConfig.java`) defines which endpoints are public (`permitAll()`) and which require authentication (`authenticated()`).
    *   Specific actions like adding/removing group members are further restricted to the group creator within the controller logic.

## 11. Database Schema

The database schema is defined by the JPA entities in `backend/src/main/java/com/code/codenest/model/` and outlined in `Schema.txt`. Key tables include:
*   `users`: Stores user information, credentials, and profile links.
*   `snips`: Stores code snippets, expiration details, view counts, and user associations.
*   `tags` & `snip_tags`: Manage tagging functionality.
*   `messages`: Stores private messages between users, with optional snippet attachments.
*   `groups`, `group_members`, `group_snips`: Manage group functionality, memberships, and snippets shared within groups.
*   `view_logs` & `expiration_logs`: Track snippet views and expirations.

## 12. Deployment Notes

*   The backend is a Spring Boot application, typically deployed as a JAR file on a Java-compatible server (e.g., Tomcat, or directly using the embedded server).
*   The frontend is a Vite-React application, built into static assets that can be served by any web server (e.g., Nginx, Apache, or platforms like Vercel/Netlify).
*   Ensure the backend's `application.properties` is correctly configured for the production PostgreSQL database.
*   The frontend's Vite proxy (`vite.config.ts`) is for development; in production, a reverse proxy (like Nginx) or platform-specific routing should be used to direct `/api` calls to the backend server.
*   CORS configuration in `WebConfig.java` needs to be updated with the frontend's production URL.

## 13. Future Enhancements

*   Real-time updates for messages and group shares (e.g., using WebSockets/SSE).
*   More advanced snippet organization (folders, private/public toggle beyond expiration).
*   Search functionality for snippets and users.
*   Notifications for new messages or group activity.
*   Password reset functionality.
*   Syntax highlighting language detection improvement for snippets.
*   Enhanced UI/UX for mobile devices.
*   More robust error handling and user feedback on the frontend.
*   Unit and integration tests for both backend and frontend.
