import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { UserControllers } from "./user.controller";

const router = express.Router();

router.get("/me", auth("USER", "ADMIN"), UserControllers.getMyProfile);
router.patch("/me", auth("USER", "ADMIN"), validateRequest(userValidation.updateUser), UserControllers.updateMyProfile);

router.get("/interests", auth("ADMIN"), UserControllers.getUsersGroupedByInterests);

router.get("/", auth("ADMIN"), UserControllers.getAllUsers);
router.post("/", auth("ADMIN"), validateRequest(userValidation.createUser), UserControllers.createUser);

router.get("/:id/posts", UserControllers.getUserWithPosts);
router.get("/:id", auth("ADMIN"), UserControllers.getUserById);
router.patch("/:id", auth("ADMIN"), validateRequest(userValidation.updateUser), UserControllers.updateUser);
router.delete("/:id", auth("ADMIN"), UserControllers.deleteUser);

export const UserRouters = router;
