// utils/generateToken.js
const jwt = require("jsonwebtoken");

// Cần thêm tham số isAdmin vào đây
const generateToken = (id, isAdmin) => {
  return jwt.sign(
    { id, isAdmin }, // <--- BƯỚC QUAN TRỌNG
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;
