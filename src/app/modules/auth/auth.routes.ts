import express from "express";
import authenticate from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post("/register", validateRequest(authValidation.registerUser), AuthControllers.registerUser);
router.post("/verify-otp", validateRequest(authValidation.verifyOtp), AuthControllers.verifyOtp);
router.post("/resend-otp", validateRequest(authValidation.resendOtp), AuthControllers.resendOtp);
router.post("/login", validateRequest(authValidation.loginUser), AuthControllers.loginUser);
router.post("/refresh", validateRequest(authValidation.refreshToken), AuthControllers.refreshToken);
router.post("/logout", AuthControllers.logout);


router.post("/forgot-password", validateRequest(authValidation.forgotPassword), AuthControllers.forgotPassword);
router.post("/verify-reset-otp", validateRequest(authValidation.verifyResetOtp), AuthControllers.verifyResetOtp);
router.post("/reset-password", validateRequest(authValidation.resetPassword), AuthControllers.resetPassword);


router.post("/change-password", authenticate, validateRequest(authValidation.changePassword), AuthControllers.changePassword);

export const AuthRouters = router;
