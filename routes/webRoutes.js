const express = require("express");
const router = express.Router();
const Perfume = require("../models/Perfume"); // Giả định
const Member = require("../models/Member");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// 1. Tuyến Trang chủ (Yêu cầu Task 1)
router.get("/", async (req, res, next) => {
  try {
    // Lấy danh sách nước hoa, cần populate tên thương hiệu
    const perfumes = await Perfume.find().populate("brand").lean();

    // Render index.ejs và truyền dữ liệu
    res.render("index", {
      title: "Perfume Store",
      perfumes: perfumes,
      member: req.member, // Có thể null nếu chưa đăng nhập
    });
  } catch (err) {
    next(err);
  }
});

// Tuyến Admin Dashboard
router.get("/admin/dashboard", protect, admin, (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    member: req.member, // Kiểm tra phân quyền trong EJS
  });
});

// Tuyến Danh sách Member (Task 4)
router.get("/admin/memberList", protect, admin, async (req, res, next) => {
  try {
    // Lấy danh sách member từ controller API (hoặc model)
    const members = await Member.find().select("-password");
    res.render("admin/memberList", {
      title: "Quản lý Thành viên",
      members: members,
      member: req.member,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Tuyến Chi tiết nước hoa (Yêu cầu Task 1)
router.get("/perfumes/:id", async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate("brand")
      .populate({
        path: "comments.author", // Populate tác giả của comment
        select: "name", // Chỉ lấy tên
      })
      .lean();

    if (!perfume) return res.status(404).render("404");

    // Render trang chi tiết
    res.render("perfumeDetail", {
      title: perfume.perfumeName,
      perfume: perfume,
      member: req.member,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Tuyến Profile (Yêu cầu Task 1 - chỉ thành viên mới xem được)
router.get("/profile", protect, (req, res) => {
  // req.member có sẵn từ middleware protect
  res.render("profile", {
    title: "User Profile",
    member: req.member,
  });
});

// 4. Tuyến Đăng nhập/Đăng ký (chỉ là giao diện)
router.get("/auth/login", (req, res) =>
  res.render("auth/login", {
    title: "Login",
    member: req.member || null,
  })
);

router.get("/auth/register", (req, res) =>
  res.render("auth/register", {
    title: "Register",
    member: req.member || null,
  })
);

module.exports = router;
