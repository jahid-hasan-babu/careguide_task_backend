import { z } from "zod";

const createNote = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const updateNote = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export const noteValidation = { createNote, updateNote };
