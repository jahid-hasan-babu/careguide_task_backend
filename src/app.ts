import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import httpStatus from "http-status";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { authLimiter, globalLimiter } from "./app/middlewares/rateLimiter";
import router from "./app/routes";

const app: Application = express();

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("Blocked by CORS policy"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "50kb", extended: true }));

app.use(mongoSanitize());
app.use(hpp());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1", globalLimiter);
app.get("/", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Secure Note-Taking API is running.",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;

