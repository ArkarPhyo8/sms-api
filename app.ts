import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import cors from "cors";

//Import Routes
import schoolRouter from "./routes/school.routes";
import authRouter from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { globalErrorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { authMiddleware } from "./middleware/auth.middleware";

config();
const app: Express = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

//Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use(express.static(path.join(__dirname, "public")));

//API Routes
app.use("/api/auth", authRouter);

app.use(authMiddleware);
app.use("/api/users", userRoutes);
app.use("/api/school", schoolRouter);

// Home Pag
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// About Page
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

/* post method */
app.post("/", (req: Request, res: Response) => {
  res.send("Hello World! This is a post method");
});

/* put method */
app.put("/user", (req: Request, res: Response) => {
  res.send("Hello World! This is a put method");
});

/* delete method */
app.delete("/user", (req: Request, res: Response) => {
  res.send("Hello World! This is a delete method");
});

//Not Found Middleware
app.use(notFoundHandler);

//Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
