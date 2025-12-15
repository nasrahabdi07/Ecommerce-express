import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


mongoose
  .connect("mongodb://127.0.0.1:27017/course-registration")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));


app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use("/api/students", studentRoutes);

const PORT = 5050;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
