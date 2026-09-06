import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { noteValidation } from "./note.validation";
import { NoteControllers } from "./note.controller";

const router = express.Router();

router.post("/", auth("USER", "ADMIN"), validateRequest(noteValidation.createNote), NoteControllers.createNote);
router.get("/", auth("USER", "ADMIN"), NoteControllers.getNotes);
router.get("/:id", auth("USER", "ADMIN"), NoteControllers.getNoteById);
router.patch("/:id", auth("USER", "ADMIN"), validateRequest(noteValidation.updateNote), NoteControllers.updateNote);
router.delete("/:id", auth("USER", "ADMIN"), NoteControllers.deleteNote);

export const NoteRouters = router;
