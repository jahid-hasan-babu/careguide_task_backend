import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { NoteServices } from "./note.service";

const createNote = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NoteServices.createNote(req.user.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Note created successfully.", data: result });
});

const getNotes = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NoteServices.getNotes(req.user.id, req.user.role, {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notes retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getNoteById = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NoteServices.getNoteById(req.params.id, req.user.id, req.user.role);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Note retrieved successfully.", data: result });
});

const updateNote = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NoteServices.updateNote(req.params.id, req.user.id, req.user.role, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Note updated successfully.", data: result });
});

const deleteNote = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NoteServices.deleteNote(req.params.id, req.user.id, req.user.role);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Note deleted successfully.", data: result });
});

export const NoteControllers = { createNote, getNotes, getNoteById, updateNote, deleteNote };
