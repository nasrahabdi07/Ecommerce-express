import express from "express";
import Student from "../models/Student.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const existing = await Student.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = new Student(req.body);
    await student.save();

    res.status(201).json({
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });

    if (!student || student.password !== req.body.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.post("/update-courses", async (req, res) => {
  try {
    const { email, courses } = req.body;

    const updatedStudent = await Student.findOneAndUpdate(
      { email },
      { courses: courses }, 
      { new: true } 
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Courses saved successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Course update error:", error);
    res.status(500).json({ message: "Error saving courses", error: error.message });
  }
});

console.log("✅ studentRoutes loaded successfully");
export default router;
