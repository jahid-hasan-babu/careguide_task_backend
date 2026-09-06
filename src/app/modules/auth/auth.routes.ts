import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post("/register", validateRequest(authValidation.registerUser), AuthControllers.registerUser);
router.post("/login", validateRequest(authValidation.loginUser), AuthControllers.loginUser);

export const AuthRouters = router;
