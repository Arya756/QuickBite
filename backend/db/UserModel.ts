import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Password will not be returned in find queries by default
  },
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN"],
    default: "CUSTOMER"
  }
}, {
  timestamps: true
});

export default mongoose.model("User", UserSchema);
