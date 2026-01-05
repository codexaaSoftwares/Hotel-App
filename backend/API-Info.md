# API Integration Overview

This document summarizes the authentication, user management, and role/permission APIs that power
the Photo Studio Management platform. Use it as the source of truth when wiring the admin
application or any external client to the Laravel backend.

---

## Base Configuration

- **Base URL (local):** `http://localhost:8000/api`
- **Base URL (production example):** `https://<your-domain>/api`
- **Authentication:** [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- **Auth header:** `Authorization: Bearer <token>`
- **Content type:** `application/json`

> All protected endpoints require a valid Sanctum token generated during login.

---

## Authentication

### `POST /auth/login`

Authenticate a user and create a Sanctum token.

| Field     | Type     | Required | Notes                      |
|-----------|----------|----------|----------------------------|
| email     | string   | ✅        | Valid email                |
| password  | string   | ✅        | Plain-text password        |

**Response**

```json
{
  "token": "plain-text-sanctum-token",
  "user": {
    "id": 1,
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@example.com",
    "status": "active",
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "description": "Administrator with full access",
        "is_active": true,
        "is_deleted": false,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "created_at": "...",
    "updated_at": "..."
  },
  "permissions": [
    {
      "id": 1,
      "name": "view_user",
      "description": "View users",
      "module": "users",
      "submodule": "management",
      "type": "read"
    }
    // ...
  ],
  "permissionsByModule": {
    "users": {
      "management": [
        {
          "id": 1,
          "name": "view_user",
          "description": "View users",
          "type": "read"
        }
      ]
    }
  }
}
```

> **Tip:** Persist the plain text `token` client-side and send it with every protected request.

### `GET /auth/user`

Return the authenticated user, their roles, and derived permissions (identical structure to the
login response, minus the token). Useful on page refresh to rebuild session state.

### `POST /auth/logout`

Invalidates the current Sanctum token. Always recommended on explicit logout.

### `POST /auth/forgot-password`

Requests a password-reset email. The built-in Laravel implementation is used; configure mail
settings before invoking.

| Field | Type   | Required |
|-------|--------|----------|
| email | string | ✅        |

---

## User Management

All routes require authentication.

### `GET /users`

Paginated list of users with their assigned roles.

| Query        | Type    | Notes                                    |
|--------------|---------|------------------------------------------|
| search       | string  | Matches first name, last name, or email |
| status       | string  | Filter by status (e.g. `active`)        |
| per_page     | int     | Defaults to 15                           |
| page         | int     | Defaults to 1                            |

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com",
      "phone": null,
      "status": "active",
      "roles": [
        { "id": 1, "name": "admin", "description": "Administrator with full access", "is_active": true, "is_deleted": false, "created_at": "...", "updated_at": "..." }
      ],
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 4,
    "last_page": 1
  }
}
```

### `POST /users`

Create a user and optionally assign roles.

| Field       | Type     | Required | Notes                                        |
|-------------|----------|----------|----------------------------------------------|
| first_name  | string   | ✅        |                                              |
| last_name   | string   | ✅        |                                              |
| email       | string   | ✅        | Unique, valid email                          |
| password    | string   | ✅        | Minimum 8 characters                         |
| phone       | string   | optional |                                              |
| status      | string   | optional | e.g. `active`, `inactive`                    |
| address     | string   | optional |                                              |
| city        | string   | optional |                                              |
| country     | string   | optional |                                              |
| bio         | string   | optional |                                              |
| roles       | array    | optional | Array of role IDs **or** role names          |

> The controller automatically hashes the password and syncs the provided roles.

### `GET /users/{id}`

Return the specified user with assigned roles.

### `PUT /users/{id}`

Update user details. All fields are optional; send only what should change.
If `roles` is supplied, the assignments are synchronized with the provided array (IDs or names).
To keep the existing password, omit the `password` field.

### `DELETE /users/{id}`

Soft deletes are not currently implemented—this endpoint performs a hard delete of the user record
and cascades pivot assignments.

---

## Role Management

### `GET /roles`

Return all active (non-deleted) roles and their permissions. Use query `?active=1` to limit to
active roles.

**Response snippet**

```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Administrator with full access",
    "is_active": true,
    "is_deleted": false,
    "permissions": [
      { "id": 1, "name": "view_user", "description": "View users", "module": "users", "submodule": "management", "type": "read" }
    ],
    "created_at": "...",
    "updated_at": "..."
  }
]
```

### `POST /roles`

Create a role. All fields except `name` are optional.

| Field        | Type    | Required | Notes                                     |
|--------------|---------|----------|-------------------------------------------|
| name         | string  | ✅        | Must be unique                            |
| description  | string  | optional |                                           |
| is_active    | boolean | optional | Defaults to `true`                        |
| permissions  | array   | optional | Permission IDs; use `PUT /roles/{id}/permissions` for updates |

### `PUT /roles/{id}`

Update role metadata (name, description, active flag). Does **not** change permissions—use the
dedicated endpoint below.

### `PUT /roles/{id}/permissions`

Synchronize permissions for a role.

| Field         | Type  | Required | Notes                             |
|---------------|-------|----------|-----------------------------------|
| permissions   | array | ✅        | Array of permission IDs           |

### `DELETE /roles/{id}`

Marks the role as deleted (`is_deleted = true`). Existing user assignments remain intact but can be
filtered out on the client by checking the `is_deleted` flag.

---

## Permission Directory

### `GET /permissions`

Return all non-deleted permissions. Supports filtering and grouping.

| Query             | Type    | Notes                                               |
|-------------------|---------|-----------------------------------------------------|
| module            | string  | Filter by module                                    |
| submodule         | string  | Filter by sub-module                                |
| active            | boolean | `1`/`true` for active permissions only              |
| group_by_module   | boolean | When truthy, returns a nested module/submodule map  |

**Grouped Response Example (`?group_by_module=1`)**

```json
{
  "users": {
    "management": [
      { "id": 1, "name": "view_user", "description": "View users", "type": "read" },
      { "id": 2, "name": "create_user", "description": "Create users", "type": "write" }
    ]
  },
  "roles": {
    "management": [
      { "id": 5, "name": "view_role", "description": "View roles", "type": "read" }
    ]
  }
}
```

Use this endpoint to dynamically build permission pickers in the admin UI.

---

## Seed Data

Running `php artisan db:seed` populates the core RBAC tables:

- **Roles:** `admin`, `manager`, `staff`
- **Permissions:** Create/View/Edit/Delete for users and roles, view/edit settings, and permission
  visibility
- **Default admin user:** `admin@example.com` / `password`

---

## Integration Recommendations

- Always request `GET /auth/user` after a page refresh if a token is present to keep local state in
  sync.
- Normalize snake_case response fields to camelCase in the frontend if needed.
- Map permission names to UI-friendly strings (e.g. `view_user` → `user:read`) on the client while
  preserving the canonical backend identifiers.
- When creating or updating users, you may send role IDs *or* names. Names are resolved server-side
  for convenience.
- Treat pagination metadata from `GET /users` as authoritative; avoid client-side slicing when the
  dataset grows.

---

## Error Handling

The API follows Laravel conventions:

- **401** — Missing or invalid token
- **403** — User lacks the required permission (middleware checks can be added per route)
- **422** — Validation errors (returns a keyed `errors` object)
- **429** — Optional rate limiting (not enabled by default)
- **500** — Server error; inspect `storage/logs/laravel.log`

Always surface validation messages to the user when possible.

---

For additional endpoints and architectural notes, refer to:

- `backend_project_structure.md` — Backend layout & conventions
- `admin_project_Structure.md` — Admin SPA guidelines
- `API_DOCUMENTATION.md` — Any auto-generated or extended API references

*Last reviewed:* November 2025


