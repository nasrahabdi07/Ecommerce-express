import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  schoolId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  
  courses: [
    {
      course: String,
      lecturer: String,
    }
  ]
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
