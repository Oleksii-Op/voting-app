# Team Voting System - Backend API Documentation

A comprehensive guide to all API endpoints for the Team Voting System built with FastAPI.

## Base URL
```
http://localhost:8000
```

## API Version
All endpoints are prefixed with `/v1`

---

## 🔐 Authentication

The API uses two authentication methods:
- **Cookie Authentication**: For member endpoints using `users-token` cookie
- **API Key Authentication**: For admin endpoints using `x-api-key` header

---

# 👤 Member/User Endpoints

## GET /v1/token

**Description:**
Generates a new registration token for member signup. Admin access required.

**Authentication:** Admin API Key Required

**Headers:**
- `x-api-key` (string, required): Admin API key

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/token' \
  -H 'accept: application/json' \
  -H 'x-api-key: admin123'
```

**Responses:**
- **200 OK**: Returns the generated token
  ```json
  "abc123def456ghi789"
  ```
- **401 Unauthorized**: Invalid or missing API key
  ```json
  {
    "detail": "Invalid or missing API Key"
  }
  ```

---

## POST /v1/register/{token}

**Description:**
Registers a new member using a valid token obtained from admin. Sets authentication cookie upon success.

**Authentication:** None (uses token validation)

**Path Parameters:**
- `token` (string, required): Registration token obtained from admin

**Request Body:**
```json
{
  "name": "string",      // 1-20 characters
  "username": "string"   // 1-30 characters, unique
}
```

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/register/abc123def456ghi789' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "username": "johndoe123"
  }'
```

**Responses:**
- **201 Created**: Member registered successfully
  ```json
  {
    "name": "John Doe",
    "username": "johndoe123"
  }
  ```
- **401 Unauthorized**: Invalid token
  ```json
  {
    "detail": "Invalid token"
  }
  ```
- **400 Bad Request**: Username already exists or validation error

**Side Effects:**
- Sets `users-token` cookie (httponly, 24-hour expiry)
- Removes token from available tokens pool
- Logs member registration

---

## GET /v1/users/me

**Description:**
Returns the current authenticated member's profile information.

**Authentication:** Cookie Authentication Required

**Headers:** None (uses cookie)

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/users/me' \
  -H 'accept: application/json' \
  -b 'users-token=abc123def456ghi789'
```

**Responses:**
- **200 OK**: Returns member profile
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe123",
    "has_joined_team": true,
    "has_voted": false,
    "team_id": 2,
    "vote_id": null
  }
  ```
- **401 Unauthorized**: Missing or invalid cookie
  ```json
  {
    "detail": "Missing token cookie"
  }
  ```

---

## PATCH /v1/users/me

**Description:**
Updates the current member's profile information. Only name field is updatable by members.

**Authentication:** Cookie Authentication Required

**Headers:** 
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string"  // Optional, 1-20 characters
}
```

**Example:**
```bash
curl -X 'PATCH' \
  'http://localhost:8000/v1/users/me' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -b 'users-token=abc123def456ghi789' \
  -d '{
    "name": "Jane Doe"
  }'
```

**Responses:**
- **200 OK**: Profile updated successfully
  ```json
  {
    "id": 1,
    "name": "Jane Doe",
    "username": "johndoe123",
    "has_joined_team": true,
    "has_voted": false,
    "team_id": 2,
    "vote_id": null
  }
  ```
- **401 Unauthorized**: Missing or invalid cookie

---

## DELETE /v1/users/me

**Description:**
Permanently deletes the current member's account and all associated data.

**Authentication:** Cookie Authentication Required

**Headers:** None

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'DELETE' \
  'http://localhost:8000/v1/users/me' \
  -b 'users-token=abc123def456ghi789'
```

**Responses:**
- **204 No Content**: Account deleted successfully
- **401 Unauthorized**: Missing or invalid cookie

**Warning:** This operation is irreversible and removes all member data including team membership and voting records.

---

## GET /v1/users/reset/{token}

**Description:**
Resets user authentication cookie with a new token. Allows access recovery.

**Authentication:** None

**Path Parameters:**
- `token` (string, required): New authentication token

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/users/reset/new_token_here'
```

**Responses:**
- **200 OK**: Cookie reset successfully

**Side Effects:**
- Sets new `users-token` cookie (httponly, 24-hour expiry)

---

## POST /v1/users/join/{team_id}

**Description:**
Joins a team as the current member. Members can only join one team.

**Authentication:** Cookie Authentication Required

**Path Parameters:**
- `team_id` (integer, required): ID of the team to join

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/users/join/2' \
  -H 'accept: application/json' \
  -b 'users-token=abc123def456ghi789'
```

**Responses:**
- **200 OK**: Successfully joined team
- **403 Forbidden**: Member has already joined a team
  ```json
  {
    "detail": "You cannot join a team twice"
  }
  ```
- **404 Not Found**: Team doesn't exist
  ```json
  {
    "detail": "Team not found"
  }
  ```
- **401 Unauthorized**: Missing or invalid cookie

**Business Rules:**
- Members can only join one team
- Must not have already joined a team

**Side Effects:**
- Updates member's team relationship
- Sets `has_joined_team` flag to True
- Logs team join action

---

## POST /v1/users/leave/

**Description:**
Leaves the current team membership. Preserves voting status.

**Authentication:** Cookie Authentication Required

**Headers:** None

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/users/leave/' \
  -H 'accept: application/json' \
  -b 'users-token=abc123def456ghi789'
```

**Responses:**
- **200 OK**: Successfully left team
- **403 Forbidden**: Member hasn't joined a team
  ```json
  {
    "detail": "You have not joined a team yet"
  }
  ```
- **401 Unauthorized**: Missing or invalid cookie

**Business Rules:**
- Member must have joined a team to leave
- Voting status is preserved after leaving team

**Side Effects:**
- Removes team relationship
- Sets `has_joined_team` flag to False
- Logs team leave action

---

# 🗳️ Voting Endpoints

## POST /v1/voting/{team_id}

**Description:**
Casts a vote for a specific team. Members cannot vote for their own team and can only vote once.

**Authentication:** Cookie Authentication Required

**Path Parameters:**
- `team_id` (integer, required): ID of the team to vote for

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/voting/3' \
  -H 'accept: application/json' \
  -b 'users-token=abc123def456ghi789'
```

**Responses:**
- **200 OK**: Vote cast successfully
- **400 Bad Request**: Cannot vote for own team or already voted
  ```json
  {
    "detail": "You cannot vote for your own team."
  }
  ```
  ```json
  {
    "detail": "You have already voted"
  }
  ```
- **404 Not Found**: Team doesn't exist
  ```json
  {
    "detail": "Team not found"
  }
  ```
- **401 Unauthorized**: Missing or invalid cookie

**Business Rules:**
- Members cannot vote for their own team
- Members can only vote once
- Members can vote even if not on a team

**Side Effects:**
- Creates voting relationship between member and team
- Sets member's `has_voted` flag to True

---

## POST /v1/voting/rollback/

**Description:**
Removes the member's current vote, allowing them to vote again for a different team.

**Authentication:** Cookie Authentication Required

**Headers:** None

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/voting/rollback/' \
  -H 'accept: application/json' \
  -b 'users-token=abc123def456ghi789'
```

**Responses:**
- **204 No Content**: Vote removed successfully
- **400 Bad Request**: Member has not voted yet
  ```json
  {
    "detail": "You have not voted"
  }
  ```
- **401 Unauthorized**: Missing or invalid cookie

**Business Rules:**
- Member must have voted previously
- Completely removes vote relationship

**Side Effects:**
- Removes voting relationship
- Sets member's `has_voted` flag to False
- Allows member to vote for a different team

---

## GET /v1/voting/count

**Description:**
Returns voting statistics for all teams that have received votes.

**Authentication:** None (Public endpoint)

**Headers:** None

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/voting/count' \
  -H 'accept: application/json'
```

**Responses:**
- **200 OK**: Returns voting statistics
  ```json
  [
    {
      "name": "Team Alpha",
      "stats": {
        "votes": 5
      }
    },
    {
      "name": "Team Beta",
      "stats": {
        "votes": 3
      }
    }
  ]
  ```

**Notes:**
- Only shows teams that have received at least one vote
- Results are ordered by team name alphabetically
- No authentication required - voting results are public

---

# 👥 Team Endpoints

## GET /v1/teams

**Description:**
Returns a list of all teams in the system with their basic information.

**Authentication:** None (Public endpoint)

**Headers:** None

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/teams' \
  -H 'accept: application/json'
```

**Responses:**
- **200 OK**: Returns list of teams
  ```json
  [
    {
      "id": 1,
      "name": "Team Alpha",
      "avatar": "https://example.com/avatar1.png"
    },
    {
      "id": 2,
      "name": "Team Beta",
      "avatar": null
    }
  ]
  ```
- **404 Not Found**: No teams exist
  ```json
  {
    "detail": "No teams found"
  }
  ```

**Use Cases:**
- Display available teams for voting
- Show team selection for joining
- Public team directory

---

## GET /v1/teams/{team_id}/users

**Description:**
Returns all members of a specific team with their names.

**Authentication:** None (Public endpoint)

**Path Parameters:**
- `team_id` (integer, required): ID of the team

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/teams/1/users' \
  -H 'accept: application/json'
```

**Responses:**
- **200 OK**: Returns team information with member list
  ```json
  {
    "name": "Team Alpha",
    "avatar": "https://example.com/avatar1.png",
    "members": [
      {
        "name": "John Doe"
      },
      {
        "name": "Jane Smith"
      }
    ]
  }
  ```
- **404 Not Found**: Team doesn't exist or has no members
  ```json
  {
    "detail": "Team not found"
  }
  ```
  ```json
  {
    "detail": "Empty team"
  }
  ```

**Privacy Notes:**
- Only shows member names, not sensitive information like votes
- Public endpoint for transparency

---

## POST /v1/teams

**Description:**
Creates a new team in the system. Admin access required.

**Authentication:** Admin API Key Required

**Headers:**
- `x-api-key` (string, required): Admin API key
- `Content-Type: application/json`

**Query Parameters:** None

**Request Body:**
```json
{
  "name": "string",           // Required, max 32 characters, unique
  "avatar": "string|null"     // Optional, URL to avatar image
}
```

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/teams' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: admin123' \
  -d '{
    "name": "Team Gamma",
    "avatar": "https://example.com/avatar3.png"
  }'
```

**Responses:**
- **201 Created**: Team created successfully
  ```json
  {
    "name": "Team Gamma",
    "avatar": "https://example.com/avatar3.png"
  }
  ```
- **400 Bad Request**: Team name already exists
  ```json
  {
    "detail": "Team already exists"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Business Rules:**
- Team name must be unique
- Avatar URL is optional
- Names are limited to 32 characters

**Side Effects:**
- Logs team creation for audit trail

---

## PATCH /v1/teams/{team_id}

**Description:**
Updates an existing team's information. Admin access required.

**Authentication:** Admin API Key Required

**Path Parameters:**
- `team_id` (integer, required): ID of the team to update

**Headers:**
- `x-api-key` (string, required): Admin API key
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string|null",      // Optional, max 32 characters, unique
  "avatar": "string|null"     // Optional, URL to avatar image
}
```

**Example:**
```bash
curl -X 'PATCH' \
  'http://localhost:8000/v1/teams/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: admin123' \
  -d '{
    "name": "Team Alpha Updated",
    "avatar": "https://example.com/new-avatar.png"
  }'
```

**Responses:**
- **200 OK**: Team updated successfully
  ```json
  {
    "id": 1,
    "name": "Team Alpha Updated",
    "avatar": "https://example.com/new-avatar.png"
  }
  ```
- **400 Bad Request**: New team name conflicts with existing team
  ```json
  {
    "detail": "Team already exists"
  }
  ```
- **404 Not Found**: Team doesn't exist
  ```json
  {
    "detail": "Team not found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Known Issue:** Currently validates name uniqueness even when updating with the same name.

---

## DELETE /v1/teams/{team_id}

**Description:**
Permanently deletes a team and all associated data. Admin access required.

**Authentication:** Admin API Key Required

**Path Parameters:**
- `team_id` (integer, required): ID of the team to delete

**Headers:**
- `x-api-key` (string, required): Admin API key

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'DELETE' \
  'http://localhost:8000/v1/teams/1' \
  -H 'x-api-key: admin123'
```

**Responses:**
- **204 No Content**: Team deleted successfully
- **404 Not Found**: Team doesn't exist
  ```json
  {
    "detail": "Team not found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Warning:** This is an irreversible operation that:
- Removes all team data, member relationships, and received votes
- Members who were in this team will have `team_id` set to null
- May significantly affect voting statistics
- Could cause referential integrity issues

---

# 🔧 Admin Endpoints

## GET /v1/admin/members

**Description:**
Returns all registered members in the system with complete information. Admin access required.

**Authentication:** Admin API Key Required

**Headers:**
- `x-api-key` (string, required): Admin API key

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/admin/members' \
  -H 'accept: application/json' \
  -H 'x-api-key: admin123'
```

**Responses:**
- **200 OK**: Returns list of all members
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe123",
      "has_joined_team": true,
      "has_voted": false,
      "team_id": 2,
      "vote_id": null
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "username": "janesmith456",
      "has_joined_team": false,
      "has_voted": true,
      "team_id": null,
      "vote_id": 1
    }
  ]
  ```
- **404 Not Found**: No members exist
  ```json
  {
    "detail": "No members found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Privacy:** Secured endpoint to protect member voting privacy

---

## GET /v1/admin/member/{member_id}

**Description:**
Returns specific member details by ID. Admin access required.

**Authentication:** Admin API Key Required

**Path Parameters:**
- `member_id` (integer, required): ID of the member

**Headers:**
- `x-api-key` (string, required): Admin API key

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'GET' \
  'http://localhost:8000/v1/admin/member/1' \
  -H 'accept: application/json' \
  -H 'x-api-key: admin123'
```

**Responses:**
- **200 OK**: Returns member information
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe123",
    "has_joined_team": true,
    "has_voted": false,
    "team_id": 2,
    "vote_id": null
  }
  ```
- **404 Not Found**: Member doesn't exist
  ```json
  {
    "detail": "Member not found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

---

## POST /v1/admin/member

**Description:**
Creates a new member directly through admin panel with full control over all fields.

**Authentication:** Admin API Key Required

**Headers:**
- `x-api-key` (string, required): Admin API key
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string",                // Required, 1-20 characters
  "username": "string",            // Required, 1-30 characters, unique
  "has_joined_team": false,        // Default: false
  "token": "string",               // Required, unique
  "team_id": "integer|null"        // Optional, must exist if provided
}
```

**Example:**
```bash
curl -X 'POST' \
  'http://localhost:8000/v1/admin/member' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: admin123' \
  -d '{
    "name": "Admin User",
    "username": "adminuser",
    "has_joined_team": false,
    "token": "admin_token_123",
    "team_id": null
  }'
```

**Responses:**
- **201 Created**: Member created successfully
  ```json
  {
    "id": 3,
    "name": "Admin User",
    "username": "adminuser",
    "has_joined_team": false,
    "has_voted": false,
    "team_id": null,
    "vote_id": null
  }
  ```
- **400 Bad Request**: Username already exists
  ```json
  {
    "detail": "A member with that username already exists"
  }
  ```
- **406 Not Acceptable**: Logical error (joined team but no team_id)
  ```json
  {
    "detail": "Logical error. A member has joined team, but no relationship found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Business Rules:**
- Username must be unique
- If `has_joined_team` is True, `team_id` must be provided
- Token must be unique

**Side Effects:**
- Logs admin member creation for audit trail

---

## PATCH /v1/admin/member/{member_id}

**Description:**
Updates any member's information through admin panel with full privileges.

**Authentication:** Admin API Key Required

**Path Parameters:**
- `member_id` (integer, required): ID of the member to update

**Headers:**
- `x-api-key` (string, required): Admin API key
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string|null",       // Optional, 1-20 characters
  "username": "string|null",   // Optional, 1-30 characters, unique
  "token": "string|null"       // Optional, unique
}
```

**Example:**
```bash
curl -X 'PATCH' \
  'http://localhost:8000/v1/admin/member/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: admin123' \
  -d '{
    "name": "John Doe Updated",
    "username": "johndoe_new"
  }'
```

**Responses:**
- **200 OK**: Member updated successfully
  ```json
  {
    "id": 1,
    "name": "John Doe Updated",
    "username": "johndoe_new",
    "has_joined_team": true,
    "has_voted": false,
    "team_id": 2,
    "vote_id": null
  }
  ```
- **404 Not Found**: Member doesn't exist
  ```json
  {
    "detail": "Member not found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Admin Capabilities:**
- Change any member field
- Update usernames, names, and tokens
- Fix data inconsistencies

**Side Effects:**
- Logs admin update action for audit trail

---

## DELETE /v1/admin/member/{member_id}

**Description:**
Permanently deletes a member from the system. Admin access required.

**Authentication:** Admin API Key Required

**Path Parameters:**
- `member_id` (integer, required): ID of the member to delete

**Headers:**
- `x-api-key` (string, required): Admin API key

**Query Parameters:** None

**Request Body:** None

**Example:**
```bash
curl -X 'DELETE' \
  'http://localhost:8000/v1/admin/member/1' \
  -H 'x-api-key: admin123'
```

**Responses:**
- **204 No Content**: Member deleted successfully
- **404 Not Found**: Member doesn't exist
  ```json
  {
    "detail": "Member not found"
  }
  ```
- **401 Unauthorized**: Invalid or missing API key

**Warning:** This is an irreversible operation that:
- Removes all member data including team membership and votes
- May affect voting statistics
- Should be used for spam accounts or data privacy requests

**Side Effects:**
- Logs admin deletion action for audit trail

---

## Error Response Format

All error responses follow this format:
```json
{
  "detail": "Error description message"
}
```

Common HTTP status codes used:
- **200 OK**: Request successful
- **201 Created**: Resource created successfully  
- **204 No Content**: Request successful, no content returned
- **400 Bad Request**: Invalid request data or business rule violation
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Valid authentication but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **406 Not Acceptable**: Logical data inconsistency
- **422 Unprocessable Entity**: Validation errors

---

## Rate Limiting and Security

- **CORS**: Configured for frontend access
- **HTTPS**: Recommended for production
- **Input Validation**: All inputs validated using Pydantic models
- **SQL Injection Protection**: Using SQLAlchemy ORM
- **XSS Protection**: JSON responses only
- **Authentication**: Secure cookie settings and API key validation

---

## Database Schema Relationships

```
Member:
├── id (Primary Key)
├── name, username, token (Unique)
├── has_joined_team, has_voted (Booleans)
├── team_id (Foreign Key → Team.id, nullable)
└── vote_id (Foreign Key → Team.id, nullable)

Team:
├── id (Primary Key)
├── name (Unique, max 32 chars)
├── avatar (URL, nullable)
├── members (Relationship → Member.team_id)
└── voters (Relationship → Member.vote_id)
```

This documentation covers all available endpoints with their complete specifications, validation rules, and expected behaviors.