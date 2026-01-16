**Backend Role-Based Auth & LMS Overview**

This repository contains the backend for a role-based LMS system. It implements JWT authentication, role-based authorization (admin/student), enrollment request/approval workflows, and utilities for seeding/fixing roles.

**Features**

- **Authentication**: Register and login with JWT tokens.
- **Role defaults**: New registrations get the `student` role by default.
- **Role-based routes**: `roleMiddleware` restricts admin-only endpoints.
- **Enrollment workflow**: Students submit enrollment requests; admins approve and assign sequential roll numbers.
- **DB utilities**: `scripts/addRoles.js` to fix missing roles and upsert an admin user.

**Quick Start**

- Node.js 16+ recommended.
- Copy environment variables into a `.env` file in `Bytt-backend` (see **Environment**).

Install dependencies:

```bash
cd Bytt-backend
npm install
```

Run development server:

```bash
npm run dev
```

The server listens on the port set by `PORT` in your `.env` (default: 5000). A health endpoint is available at `/health`.

**Environment**
Create `.env` in `Bytt-backend` with at least the following keys:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net
DB_NAME=mydatabase
JWT_SECRET=your_jwt_secret_here
CLIENT_ORIGIN=http://localhost:3000
PORT=5000
```

**Important Scripts**

- `npm run dev` — starts the backend in development mode.
- `npm run fix:roles -- --email=... --password=...` — runs `scripts/addRoles.js` to set missing user roles to `student` and upsert an admin user. Example:

```bash
npm run fix:roles -- --email=admi@gmail.com --password=admin12345
```

Notes: pass `--email` and `--password` to create/update the admin credentials. The script is idempotent.

**Auth & Role Flow (high level)**

- `POST /api/users/register` — registers a user (role set to `student` by default).
- `POST /api/users/login` — authenticates and returns a JWT.
- Protected routes require `Authorization: Bearer <token>`.
- `roleMiddleware(['admin'])` is used to protect admin endpoints.

**Key Endpoints**

- `POST /api/users/register` — register a new user.
- `POST /api/users/login` — login (returns token and user info).
- `GET /api/users/search?roll=<roll>` — find a user by roll number (admin or protected as appropriate).
- `POST /api/enrollments/request` — student requests enrollment in a course.
- `GET /api/enrollments/requests` — admin lists enrollment requests.
- `POST /api/enrollments/approve` — admin approves a request; assigns a sequential `rollNumber`.
- `GET /health` — simple health check for the server.

Refer to the `routes` folder for the full set of endpoints and request schemas.

**Database Notes**

- A `counters` collection is used to generate sequential roll numbers using a `findOneAndUpdate` with `$inc` and `upsert`.
- Ensure your MongoDB user has the necessary permissions to read/write the collections.

**Troubleshooting**

- ERR_CONNECTION_REFUSED when calling API from frontend: ensure the backend is running (`npm run dev`) and the PORT matches the frontend's `axios` base URL (default `http://localhost:5000`).
- MongoParseError about `useNewUrlParser` / `useUnifiedTopology`: remove those deprecated options from custom scripts and use the default `MongoClient(uri)`.
- If using MongoDB Atlas, whitelist your development IP in Network Access and verify the connection string.

**Security**

- Keep `JWT_SECRET` safe and do not commit `.env` to source control.
- Use HTTPS in production and set secure cookie or token storage accordingly.

**Where to look in the code**

- `services/userService.js` — authentication, registration, and role defaults.
- `middleware/roleMiddleware.js` — checks `req.user` role against allowed roles.
- `routes/` — REST endpoints wiring for users, courses, enrollments.
- `scripts/addRoles.js` — idempotent helper to set missing roles and upsert admin.

**Next steps / TODOs**

- Implement certificate PDF generation and secure download.
- Add admin course management UI and API pagination/filters.

If you want, I can also add a sample `.env.example` and a Postman collection for the main endpoints.
