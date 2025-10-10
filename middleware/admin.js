const admin = (req, res, next) => {
  // req.member được gắn ở middleware protect
  if (req.member && req.member.isAdmin) {
    next(); // Cho phép truy cập nếu là Admin
  } else {
    res.status(403).json({ message: "Not authorized as an admin" }); // Forbidden
  }
};

module.exports = { admin };
