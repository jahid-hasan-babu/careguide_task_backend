import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { postValidation } from "./post.validation";
import { PostControllers } from "./post.controller";

const router = express.Router();

router.post("/", auth("USER", "ADMIN"), validateRequest(postValidation.createPost), PostControllers.createPost);
router.get("/", PostControllers.getAllPosts);

export const PostRouters = router;
