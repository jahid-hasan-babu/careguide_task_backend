import { z } from "zod";

const createPost = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const postValidation = { createPost };
