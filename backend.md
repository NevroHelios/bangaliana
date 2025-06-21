# Backend Development Plan for Sorbonash App

## 1. Core Technologies & Setup

*   **Programming Language & Framework:**
    *   Node.js with Express.js (common, good for I/O bound apps)
    *   Python with Django/Flask (robust, good for complex logic)
    *   (Choose based on team expertise and project needs)
*   **Database:**
    *   **MongoDB (NoSQL):** Recommended due to flexible schema of `MediaItem` (e.g., `geminiStory` with dynamic language keys, `location`, `tags`). Good for evolving data structures.
    *   **PostgreSQL (SQL):** If strong relational integrity and transactions are paramount. Can handle JSONB for flexible fields.
*   **Authentication:**
    *   JSON Web Tokens (JWT) for stateless authentication.
*   **Cloud Storage:**
    *   AWS S3, Google Cloud Storage, or Azure Blob Storage for storing media files (photos, videos).
*   **Environment Variables:**
    *   Manage sensitive data (DB connection strings, API keys, JWT secrets, cloud storage credentials) using `.env` files and environment variables in deployment.

## 2. Database Schema Design (MongoDB Example)

*   **Users Collection:**
    *   `_id`: ObjectId (Primary Key)
    *   `name`: String (Optional)
    *   `email`: String (Unique, Indexed, Required)
    *   `password`: String (Hashed, Required)
    *   `createdAt`: Timestamp
    *   `updatedAt`: Timestamp

*   **MediaItems Collection:**
    *   `_id`: ObjectId (Primary Key)
    *   `userId`: ObjectId (Refers to Users collection, Indexed)
    *   `uri`: String (URL from cloud storage, Required)
    *   `type`: String ('photo' | 'video', Required, Indexed)
    *   `timestamp`: Number (Unix timestamp, Required, Indexed)
    *   `aspectRatio`: Number (Optional)
    *   `title`: String (Optional)
    *   `description`: String (Optional)
    *   `likes`: Array of ObjectId (User IDs who liked, Indexed for querying user's likes)
    *   `comments`: Array of Embedded Documents (see below)
    *   `geminiStory`: Object (e.g., `{ en: "Story...", bn: "গল্প..." }`, Optional)
    *   `location`: Embedded Document (Optional)
        *   `latitude`: Number
        *   `longitude`: Number
        *   `name`: String (Optional)
    *   `tags`: Array of String (Optional, Indexed for search)
    *   `createdAt`: Timestamp
    *   `updatedAt`: Timestamp

    *   **Embedded Comments Structure (within MediaItems):**
        *   `_id`: ObjectId (Unique ID for each comment)
        *   `userId`: ObjectId (Refers to Users collection)
        *   `userName`: String (Denormalized for quick display, can be updated if user name changes or fetched dynamically)
        *   `text`: String (Required)
        *   `timestamp`: Number (Unix timestamp, Required)

*   **Spaces Collection:**
    *   `_id`: ObjectId (Primary Key)
    *   `title`: String (Required)
    *   `description`: String (Required)
    *   `creatorId`: ObjectId (Refers to Users collection, Indexed, Required)
    *   `timestamp`: Number (Unix timestamp, Required)
    *   `eventDate`: Number (Unix timestamp, Optional)
    *   `subscribers`: Array of ObjectId (User IDs, Indexed)
    *   `createdAt`: Timestamp
    *   `updatedAt`: Timestamp
    *   *(Consider if posts within a space should be a separate collection referencing `spaceId` if a space can have many posts, to avoid overly large space documents)*

## 3. API Endpoints (RESTful)

Corresponds to `services/api.ts` functions. All protected routes require JWT in `Authorization: Bearer <token>` header.

*   **Authentication (`/auth`)**
    *   `POST /auth/signup`:
        *   Request Body: `{ name, email, password }`
        *   Response: `{ token, user: { id, name, email } }`
        *   Action: Validate input, hash password, create new user, generate JWT.
    *   `POST /auth/login`:
        *   Request Body: `{ email, password }`
        *   Response: `{ token, user: { id, name, email } }`
        *   Action: Validate input, find user, compare hashed password, generate JWT.

*   **Media (`/media`)**
    *   `GET /media`: (Protected)
        *   Query Params: `userId` (optional, for fetching specific user's media), `page`, `limit` (for pagination).
        *   Response: `MediaItem[]`
        *   Action: Fetch media items, possibly paginated. Filter by `userId` if provided.
    *   `POST /media`: (Protected)
        *   Request Body: `multipart/form-data` containing media file and metadata (`userId`, `type`, `timestamp`, `aspectRatio`, etc.).
        *   Response: `MediaItem` (the newly created media item)
        *   Action:
            1.  Validate input.
            2.  Upload file to cloud storage.
            3.  Get the public URL of the uploaded file.
            4.  Save media metadata (including the URL) to the database.
    *   `DELETE /media/:mediaId`: (Protected)
        *   Response: `204 No Content` or `{ message: "Deleted successfully" }`
        *   Action:
            1.  Verify user owns the media item or has permission.
            2.  Delete media file from cloud storage.
            3.  Delete media item record from the database.

*   **Gemini Story Generation (`/media/:mediaId/generate-story`)**
    *   `POST /media/:mediaId/generate-story`: (Protected)
        *   Request Body: `{ prompt: string, language: 'en' | 'bn' }`
        *   Response: `{ story: string }` (The generated story in the requested language)
        *   Action:
            1.  Fetch media item details (e.g., image URI, existing metadata).
            2.  Call Google Gemini API with the prompt, media context, and language.
            3.  Store the generated story in the `MediaItem` document under the appropriate language key (e.g., `geminiStory.en` or `geminiStory.bn`).
            4.  Return the generated story.

*   **Likes (`/media/:mediaId/like`)**
    *   `POST /media/:mediaId/like`: (Protected)
        *   Response: Updated `MediaItem`
        *   Action: Add current user's ID to the `likes` array of the `MediaItem`. Ensure user ID is not added multiple times.
    *   `DELETE /media/:mediaId/like` (or `POST /media/:mediaId/unlike`): (Protected)
        *   Response: Updated `MediaItem`
        *   Action: Remove current user's ID from the `likes` array of the `MediaItem`.

*   **Comments (`/media/:mediaId/comments`)**
    *   `POST /media/:mediaId/comments`: (Protected)
        *   Request Body: `{ text: string }`
        *   Response: `Comment` (the newly created comment object, including its generated ID)
        *   Action: Create a new comment object (with `userId`, `userName` from current user, `text`, `timestamp`), add it to the `comments` array of the `MediaItem`.
    *   `DELETE /media/:mediaId/comments/:commentId`: (Protected)
        *   Response: `204 No Content` or updated `MediaItem`
        *   Action: Verify user owns the comment. Remove the comment from the `MediaItem`'s `comments` array.
    *   `GET /media/:mediaId/comments`: (Protected)
        *   Response: `Comment[]`
        *   Action: Fetch all comments for a given media item (can be part of the main media item fetch or a separate endpoint if comments are numerous).

*   **AI Chat (`/chat_response`)**
    *   `POST /chat_response`:
        *   Request Body: `{ prompt: string }`
        *   Response: Streaming text response with the AI's answer.
        *   Action: Forwards the prompt to a generative AI service (like Google Gemini) and streams the response back to the client.

*   **Spaces (`/spaces`)**
    *   `GET /spaces`: (Protected)
        *   Query Params: `page`, `limit` (for pagination).
        *   Response: `Space[]`
        *   Action: Fetch spaces, possibly paginated.
    *   `POST /spaces`: (Protected)
        *   Request Body: `{ title: string, description: string, eventDate?: number }`
        *   Response: `Space` (the newly created space)
        *   Action: Create a new space with `creatorId` as the current user.
    *   `POST /spaces/:spaceId/subscribe`: (Protected)
        *   Response: `204 No Content` or `{ message: "Subscribed" }`
        *   Action: Add current user's ID to the `subscribers` array of the `Space`.
    *   `DELETE /spaces/:spaceId/subscribe` (or `POST /spaces/:spaceId/unsubscribe`): (Protected)
        *   Response: `204 No Content` or `{ message: "Unsubscribed" }`
        *   Action: Remove current user's ID from the `subscribers` array of the `Space`.

## 4. Middleware

*   **Authentication Middleware:**
    *   Verifies JWT from `Authorization` header.
    *   Attaches user information (`req.user`) to the request object if token is valid.
    *   Rejects request with `401 Unauthorized` if token is missing or invalid.
*   **Error Handling Middleware:**
    *   Catches errors and sends standardized JSON error responses.
*   **Input Validation Middleware:**
    *   Use libraries like Joi, express-validator, or Zod to validate request bodies, query parameters, and path parameters.
*   **CORS Middleware:**
    *   Configure Cross-Origin Resource Sharing if your frontend and backend are on different domains.
*   **Request Logging Middleware:** (e.g., Morgan for Node.js)
    *   Log incoming requests for debugging and monitoring.

## 5. Security Considerations

*   **Password Hashing:** Use strong hashing algorithms like bcrypt or Argon2.
*   **Input Sanitization/Validation:** Prevent NoSQL injection, XSS, etc.
*   **HTTPS:** Always use HTTPS in production.
*   **Rate Limiting:** Protect against brute-force attacks.
*   **JWT Security:**
    *   Use strong, secret keys for signing JWTs.
    *   Store JWTs securely on the client (e.g., `AsyncStorage` is okay for React Native, but be mindful of XSS if web views are involved).
    *   Set reasonable expiration times for tokens.
    *   Implement token refresh mechanisms if needed.
*   **Authorization:** Ensure users can only access/modify their own data or data they have permissions for (e.g., deleting only their own media).
*   **Dependency Security:** Regularly update dependencies to patch vulnerabilities.

## 6. Deployment

*   **Platform:** Heroku, AWS (EC2, Elastic Beanstalk, Lambda), Google Cloud (App Engine, Cloud Run), Azure (App Service, Functions), DigitalOcean.
*   **Process Manager:** PM2 for Node.js applications to manage processes, logging, and restarts.
*   **CI/CD:** Implement Continuous Integration/Continuous Deployment pipelines (e.g., GitHub Actions, GitLab CI, Jenkins).

## 7. Additional Features & Considerations

*   **Real-time Updates:** For features like live comment updates or notifications, consider WebSockets (e.g., Socket.IO) or server-sent events.
*   **Search Functionality:** If implementing search over media items (tags, descriptions), consider dedicated search engines like Elasticsearch or Algolia, or utilize database-specific text search capabilities.
*   **Notifications:** For likes, comments, new posts in subscribed spaces (Push notifications for mobile).
*   **User Profile Management:** Endpoints to update user profiles (name, profile picture).
*   **Admin Panel:** For moderation and management.
*   **API Versioning:** Plan for API versioning (e.g., `/api/v1/...`) if significant breaking changes are anticipated in the future.
*   **Scalability:** Design with scalability in mind (stateless application servers, horizontally scalable database if possible).
*   **Testing:** Implement unit, integration, and end-to-end tests.

This plan provides a solid foundation. Each point can be expanded further based on specific project