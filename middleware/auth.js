// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const protect = async (req, res, next) => {
  // 1. Ưu tiên lấy token từ HTTP-Only Cookie (Phù hợp với SSR như EJS)
  let token = req.cookies.jwt;

  // 2. Nếu không có trong Cookie, kiểm tra Header Authorization (Nếu có)
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // Nếu không có token, chuyển hướng người dùng đến trang đăng nhập EJS
    return res.redirect("/auth/login");
  }

  try {
    // Giải mã token (verify)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin member vào request
    req.member = await Member.findById(decoded.id).select("-password");
    req.isAdmin = decoded.isAdmin; //

    if (!req.member || req.member.isDeleted) {
      console.error(
        `Truy cập bị từ chối: User ID ${decoded.id} không tồn tại hoặc đã bị xóa.`
      );
      res.clearCookie("jwt");
      return res.redirect("/auth/login");
    }

    next();
  } catch (error) {
    console.error(error);
    // Token không hợp lệ/hết hạn, xóa cookie và chuyển hướng về đăng nhập
    res.clearCookie("jwt");
    return res.redirect("/auth/login");
  }
};

const checkLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const redirectPath = decoded.isAdmin ? "/admin/dashboard" : "/";

    req.flash("success", "Bạn đã đăng nhập rồi!");

    return res.redirect(redirectPath);
  } catch (error) {
    console.error("Token hết hạn khi truy cập trang Login:", error.message);
    res.clearCookie("jwt");
    next();
  }
};

const noCache = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
};

module.exports = { protect, checkLoggedIn, noCache };
