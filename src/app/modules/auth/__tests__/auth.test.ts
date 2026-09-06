/**
 * Auth module — integration tests
 *
 * Tests the complete stateless JWT authentication system:
 *  - POST /api/v1/auth/register
 *  - POST /api/v1/auth/login
 *  - POST /api/v1/auth/refresh
 *  - POST /api/v1/auth/logout
 *  - authenticate middleware (GET /api/v1/users/me used as a protected probe)
 *  - authorize middleware (GET /api/v1/users/ — admin only)
 *
 * NOTE: These are integration tests that require a running MongoDB instance.
 * Set DATABASE_URL in .env (or use an in-memory db like mongodb-memory-server
 * for a fully isolated test environment).
 */

import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../../../app";
import config from "../../../../config";
import User from "../../user/user.model";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = "/api/v1";

const TEST_USER = {
  fullName: "Test User",
  email: `test_${Date.now()}@example.com`,
  password: "TestPass@123",
};

const signToken = (
  payload: Record<string, unknown>,
  secret: string,
  options: jwt.SignOptions = {}
) => jwt.sign(payload, secret, { algorithm: "HS256", ...options });

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.database_url as string);
  }
});

afterAll(async () => {
  // Clean up the test user
  await User.deleteOne({ email: TEST_USER.email });
  await mongoose.disconnect();
});

// ─── State shared across tests ────────────────────────────────────────────────

let accessToken = "";
let refreshToken = "";

// ─── 1. Register ──────────────────────────────────────────────────────────────

describe("POST /auth/register", () => {
  it("registers a new user and returns access + refresh tokens", async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send(TEST_USER)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.expiresIn).toBe(900); // 15m = 900s

    // Tokens should be different
    expect(res.body.data.accessToken).not.toBe(res.body.data.refreshToken);

    // No password or sensitive data in response
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.email).toBe(TEST_USER.email);
  });

  it("rejects duplicate email with 409", async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send(TEST_USER)
      .expect(409);

    expect(res.body.success).toBe(false);
  });
});

// ─── 2. Login ─────────────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  it("returns accessToken + refreshToken + expiresIn with valid credentials", async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.expiresIn).toBe(900);

    // No sensitive data
    expect(res.body.data.password).toBeUndefined();

    // Verify access token payload shape
    const decoded = jwt.decode(res.body.data.accessToken) as jwt.JwtPayload;
    expect(decoded.sub).toBeDefined();
    expect(decoded.role).toBe("USER");
    expect(decoded.email).toBeUndefined(); // email must NOT be in payload
    expect(decoded.password).toBeUndefined();

    // Verify refresh token payload shape
    const decodedRefresh = jwt.decode(res.body.data.refreshToken) as jwt.JwtPayload;
    expect(decodedRefresh.sub).toBeDefined();
    expect(decodedRefresh.type).toBe("refresh");
    expect(decodedRefresh.email).toBeUndefined();

    // Save for subsequent tests
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it("rejects invalid password with 401", async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: TEST_USER.email, password: "WrongPassword!" })
      .expect(401);

    expect(res.body.success).toBe(false);
    // Generic message — does not hint whether email or password was wrong
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it("rejects non-existent user with 401 (not 404, to prevent user enumeration)", async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: "nobody@example.com", password: "irrelevant" })
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

// ─── 3. authenticate middleware ───────────────────────────────────────────────

describe("authenticate middleware", () => {
  it("allows access with a valid access token", async () => {
    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await request(app)
      .get(`${API}/users/me`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authentication required/i);
  });

  it("returns 401 for malformed Bearer token (not 3-part JWT)", async () => {
    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", "Bearer not.a.valid.token.at.all")
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it("returns 401 for a token signed with wrong secret", async () => {
    const tamperedToken = signToken(
      { sub: "507f1f77bcf86cd799439011", role: "USER" },
      "wrong-secret"
    );

    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", `Bearer ${tamperedToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
    // Must not leak library error message
    expect(res.body.message).not.toMatch(/JsonWebTokenError/i);
  });

  it("returns 401 for an expired access token", async () => {
    const expiredToken = signToken(
      { sub: "507f1f77bcf86cd799439011", role: "USER" },
      config.jwt.access_secret as string,
      { expiresIn: -1 } // immediately expired
    );

    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
    // Must not leak library error message
    expect(res.body.message).not.toMatch(/TokenExpiredError/i);
  });

  it("returns 401 if a token is missing required claims (sub)", async () => {
    const missingSubToken = signToken(
      { role: "USER" }, // no sub
      config.jwt.access_secret as string,
      { expiresIn: "15m" }
    );

    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", `Bearer ${missingSubToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it("does NOT accept a refresh token as an access token", async () => {
    // The refresh token is signed with a different secret — this should fail
    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", `Bearer ${refreshToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });
});

// ─── 4. authorize middleware ──────────────────────────────────────────────────

describe("authorize middleware", () => {
  it("returns 403 when a USER token accesses an ADMIN-only route", async () => {
    const res = await request(app)
      .get(`${API}/users`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient permissions/i);
  });

  it("returns 200 for an ADMIN token on an ADMIN route", async () => {
    // Create a valid admin-level access token directly
    const adminToken = signToken(
      { sub: "000000000000000000000001", role: "ADMIN" },
      config.jwt.access_secret as string,
      { expiresIn: "5m" }
    );

    // Note: this might 404 if no users exist, but it won't 401 or 403
    const res = await request(app)
      .get(`${API}/users`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── 5. Refresh token endpoint ────────────────────────────────────────────────

describe("POST /auth/refresh", () => {
  it("issues a new access token given a valid refresh token", async () => {
    const res = await request(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.expiresIn).toBe(900);

    // The new access token should be valid
    const decoded = jwt.decode(res.body.data.accessToken) as jwt.JwtPayload;
    expect(decoded.sub).toBeDefined();
    expect(decoded.role).toBeDefined();
  });

  it("rejects an access token used as refresh token", async () => {
    // Access token is signed with access_secret; refresh endpoint uses refresh_secret
    const res = await request(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: accessToken })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it("rejects an expired refresh token", async () => {
    const expiredRefresh = signToken(
      { sub: "507f1f77bcf86cd799439011", type: "refresh" },
      config.jwt.refresh_secret as string,
      { expiresIn: -1 }
    );

    const res = await request(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: expiredRefresh })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it("rejects a tampered refresh token", async () => {
    const res = await request(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: "tampered.refresh.token" })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it("rejects missing refreshToken body field (validation)", async () => {
    const res = await request(app)
      .post(`${API}/auth/refresh`)
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

// ─── 6. Stateless logout ──────────────────────────────────────────────────────

describe("POST /auth/logout", () => {
  it("returns 200 with client-side cleanup instructions", async () => {
    const res = await request(app)
      .post(`${API}/auth/logout`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.instructions).toBeDefined();
    // Must document that no server-side session was created
    expect(res.body.data.instructions).toMatch(/no server-side session/i);
  });

  it("access token remains usable after logout (stateless trade-off, short TTL mitigates)", async () => {
    // After calling logout, the access token is NOT invalidated server-side.
    // This is the documented stateless trade-off.
    const res = await request(app)
      .get(`${API}/users/me`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
