import express from "express";
import authenticate from "../../middlewares/auth";
import authorize from "../../middlewares/authorization.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { UserControllers } from "./user.controller";

const router = express.Router();

// Authenticated routes
router.get("/me", authenticate, authorize("USER", "ADMIN"), UserControllers.getMyProfile);
router.patch("/me", authenticate, authorize("USER", "ADMIN"), validateRequest(userValidation.updateUser), UserControllers.updateMyProfile);

// Admin routes
router.get("/interests", authenticate, authorize("ADMIN"), UserControllers.getUsersGroupedByInterests);
router.get("/", authenticate, authorize("ADMIN"), UserControllers.getAllUsers);
router.post("/", authenticate, authorize("ADMIN"), validateRequest(userValidation.createUser), UserControllers.createUser);


router.get("/:id/posts", UserControllers.getUserWithPosts);

// Admin routes
router.get("/:id", authenticate, authorize("ADMIN"), UserControllers.getUserById);
router.patch("/:id", authenticate, authorize("ADMIN"), validateRequest(userValidation.updateUser), UserControllers.updateUser);
router.delete("/:id", authenticate, authorize("ADMIN"), UserControllers.deleteUser);

export const UserRouters = router;
