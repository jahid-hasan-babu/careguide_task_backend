import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

// Public routes — no authentication required
router.post("/register", validateRequest(authValidation.registerUser), AuthControllers.registerUser);
router.post("/login",    validateRequest(authValidation.loginUser),    AuthControllers.loginUser);

/**
 * POST /auth/refresh
 * Body: { refreshToken: string }
 *
 * Verifies the refresh token (JWT signature + type + expiry) and issues
 * a new short-lived access token. Stateless — no session is created.
 */
router.post("/refresh", validateRequest(authValidation.refreshToken), AuthControllers.refreshToken);

/**
 * POST /auth/logout
 *
 * Stateless logout endpoint.
 * The server holds no state — the client must delete both tokens.
 * Returns guidance for client-side cleanup.
 */
router.post("/logout", AuthControllers.logout);

export const AuthRouters = router;
