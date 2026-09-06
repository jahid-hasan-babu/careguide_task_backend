# Secure Note-Taking Application

A secure REST API for a note-taking platform with JWT authentication and role-based access control, built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, and **Mongoose**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT (JSON Web Tokens) |
| Password Security | bcrypt |
| Validation | Zod |

---

## Roles & Permissions

| Action | USER | ADMIN |
|---|:---:|:---:|
| Register / Login | ✅ | ✅ |
| Create / View / Update / Delete own notes | ✅ | ✅ |
| View all notes | ❌ | ✅ |
| List all users | ❌ | ✅ |
| Add / Update / Delete users | ❌ | ✅ |
| View users grouped by interests | ❌ | ✅ |
| View any user's posts | ✅ | ✅ |
| Create posts | ✅ | ✅ |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas URI or local MongoDB instance

### Installation

```bash
# Clone the repository
git clone https://github.com/jahid-hasan-babu/careguire_task_backend.git
cd careguire_task_backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/secure_notes

SUPER_ADMIN_EMAIL=admin@gmail.com
SUPER_ADMIN_PASSWORD=123456

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_ACCESS_EXPIRES_IN=30d

JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

> **Super Admin** is automatically seeded on first startup using the credentials from `.env`.

### Run with Docker Compose

For a fully containerized stack (Node.js API + MongoDB 7 + Redis 7):

```bash
# Production stack
docker compose up -d --build

# Development stack with live hot-reload
docker compose -f docker-compose.dev.yml up --build
```

See [DOCKER.md](file:///d:/Jahid_Hasan/Ai/careguide_backend/DOCKER.md) for full architecture and production deployment documentation.

---

## API Reference

### Base URL

```
http://localhost:5000/api/v1
```

---

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |

**Register Body**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "USER",
  "interests": ["chess", "reading", "coding"]
}
```

**Login Body**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response** (both endpoints return):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "accessToken": "<jwt_token>"
  }
}
```

---

### Users

> All protected endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/me` | User / Admin | Get own profile |
| PATCH | `/users/me` | User / Admin | Update own profile |
| GET | `/users/interests` | Admin | Group users by interests (Aggregation) |
| GET | `/users` | Admin | List all users (paginated) |
| POST | `/users` | Admin | Create a user |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Soft-delete user |
| GET | `/users/:id/posts` | Public | Get all posts of a user ($lookup) |

**Query params for `GET /users`:**
```
?page=1&limit=10&search=john&role=USER
```

---

### Notes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/notes` | User / Admin | Create a note |
| GET | `/notes` | User / Admin | List notes (Users see own; Admins see all) |
| GET | `/notes/:id` | User / Admin | Get note by ID (ownership enforced) |
| PATCH | `/notes/:id` | User / Admin | Update note (ownership enforced) |
| DELETE | `/notes/:id` | User / Admin | Soft-delete note (ownership enforced) |

**Query params for `GET /notes`:**
```
?page=1&limit=10
```

**Create/Update Body:**
```json
{
  "title": "My Note",
  "content": "Note content here..."
}
```

---

### Posts

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/posts` | User / Admin | Create a post |
| GET | `/posts` | Public | List all posts (paginated) |

**Create Body:**
```json
{
  "title": "My Post",
  "content": "Post content here..."
}
```

---

## Pagination Response Format

All list endpoints return:

```json
{
  "success": true,
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "data": [...]
}
```

---

## Database Indexing Strategy

All indexes are defined using `schema.index()` as required.

### `users` Collection

```ts
userSchema.index({ email: 1 }, { unique: true });
// → Supports: login lookup, profile GET by email

userSchema.index({ role: 1, createdAt: -1 });
// → Supports: admin paginated user list (filter by role, sort by date)
```

### `notes` Collection

```ts
noteSchema.index({ userId: 1, createdAt: -1 });
// → Supports: user fetching their own notes (paginated + sorted)

noteSchema.index({ _id: 1, userId: 1 });
// → Supports: single note GET with ownership check
```

### `posts` Collection

```ts
postSchema.index({ userId: 1 });
// → Supports: $lookup aggregation pipeline joining posts to user
```

> **No unnecessary indexes.** Every index maps directly to a specific query pattern described in the task.

---

## Aggregation Pipelines

### Scenario 1 — Group Users by Interests

**Endpoint:** `GET /api/v1/users/interests` *(Admin only)*

Uses exactly **one** `collection.aggregate()` call:

```js
User.aggregate([
  { $match: { isDeleted: false } },
  { $unwind: "$interests" },
  {
    $group: {
      _id: "$interests",
      users: { $push: { _id: "$_id", fullName: "$fullName", email: "$email" } },
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } },
  { $project: { interest: "$_id", users: 1, count: 1, _id: 0 } }
])
```

**Sample Response:**
```json
{
  "data": [
    {
      "interest": "chess",
      "count": 5,
      "users": [{ "_id": "...", "fullName": "Alice", "email": "alice@example.com" }]
    }
  ]
}
```

---

### Scenario 2 — User Posts via `$lookup`

**Endpoint:** `GET /api/v1/users/:id/posts` *(Public)*

Uses a **single aggregation pipeline** with a `$lookup` stage:

```js
User.aggregate([
  { $match: { _id: new ObjectId(userId), isDeleted: false } },
  {
    $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "userId",
      as: "posts"
    }
  },
  { $project: { password: 0 } }
])
```

**Sample Response:**
```json
{
  "data": {
    "_id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "posts": [
      { "_id": "...", "title": "My Post", "content": "..." }
    ]
  }
}
```

---

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Entry point — DB connect + server start
├── config/
│   └── index.ts                    # Environment config
└── app/
    ├── lib/
    │   └── mongoose.ts             # MongoDB connection
    ├── helpers/
    │   ├── catchAsync.ts
    │   ├── jwtHelpers.ts
    │   ├── paginationHelper.ts
    │   └── sendResponse.ts
    ├── middlewares/
    │   ├── auth.ts                 # JWT auth + RBAC middleware
    │   ├── validateRequest.ts
    │   └── globalErrorHandler.ts
    ├── modules/
    │   ├── auth/                   # register, login
    │   ├── user/                   # CRUD + aggregations
    │   ├── note/                   # ownership-aware CRUD
    │   └── post/                   # public read, auth write
    ├── routes/
    │   └── index.ts
    └── seedSuperAdmin/
        └── index.ts                # Auto-seeds admin on startup
```

---

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled production build
```