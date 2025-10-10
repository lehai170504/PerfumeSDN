const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    YOB: { type: Number },
    gender: { type: Boolean },
    isAdmin: { type: Boolean, default: false }, // Default role is not Admin [cite: 16, 45, 69]
  },
  { timestamps: true }
);

// Middleware để hash password trước khi lưu (pre-save hook)
memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức để so sánh password
memberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Member = mongoose.model("Members", memberSchema);
module.exports = Member;
