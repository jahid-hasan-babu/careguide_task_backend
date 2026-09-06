import express from "express";
import authenticate from "../../middlewares/auth";
import authorize from "../../middlewares/authorization.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { postValidation } from "./post.validation";
import { PostControllers } from "./post.controller";

const router = express.Router();

router.post("/", authenticate, authorize("USER", "ADMIN"), validateRequest(postValidation.createPost), PostControllers.createPost);
router.get("/",  PostControllers.getAllPosts); // public

export const PostRouters = router;
