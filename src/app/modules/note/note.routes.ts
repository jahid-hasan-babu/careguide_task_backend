import express from "express";
import authenticate from "../../middlewares/auth";
import authorize from "../../middlewares/authorization.middleware";
import validateRequest from "../../middlewares/validateRequest";
import { noteValidation } from "./note.validation";
import { NoteControllers } from "./note.controller";

const router = express.Router();

router.post("/",   authenticate, authorize("USER", "ADMIN"), validateRequest(noteValidation.createNote), NoteControllers.createNote);
router.get("/",    authenticate, authorize("USER", "ADMIN"), NoteControllers.getNotes);
router.get("/:id", authenticate, authorize("USER", "ADMIN"), NoteControllers.getNoteById);
router.patch("/:id",  authenticate, authorize("USER", "ADMIN"), validateRequest(noteValidation.updateNote), NoteControllers.updateNote);
router.delete("/:id", authenticate, authorize("USER", "ADMIN"), NoteControllers.deleteNote);

export const NoteRouters = router;
