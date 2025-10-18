const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const Brand = require("../models/Brand");
const AuthController = require("../controllers/authController");
const BrandController = require("../controllers/brandController");
const PerfumeController = require("../controllers/perfumeController");
const MemberController = require("../controllers/memberController");
const CommentController = require("../controllers/commentController");
const upload = require("../middleware/uploadMiddleware");

const getHome = async (req, res, next) => {
  try {
    const brands = await Brand.find().select("_id brandName").lean();
    const perfumes = await PerfumeController.getPerfumes(req);

    const currentSearch = req.query.search || "";
    const currentBrandId = req.query.brandId || "";

    res.render("index", {
      title: "Trang chủ",
      loggedInUser: req.user || null,
      perfumes: perfumes,
      brands: brands,
      search: currentSearch,
      brandId: currentBrandId,
      pageCss: null,
    });
  } catch (error) {
    next(error);
  }
};

const getPerfumeDetails = async (req, res, next) => {
  try {
    const perfumeData = await PerfumeController.findPerfume(req.params.id);

    if (!perfumeData) {
      // Xử lý lỗi 404 bằng cách render trang 404
      return res.status(404).render("404", { title: "Không tìm thấy" });
    }

    res.render("detail", {
      title: perfumeData.perfumeName,
      perfume: perfumeData,
      member: req.member,
      loggedInUser: req.user || null,
      pageCss: null,
    });
  } catch (error) {
    // Bắt các lỗi khác (ví dụ: lỗi kết nối DB, lỗi Mongoose,...)
    next(error);
  }
};
router.get("/auth/register", (req, res) => {
  const errors = req.flash("error");
  const successMessages = req.flash("success");
  if (req.member) return res.redirect("/");
  res.render("auth/register", {
    title: "Đăng Ký",
    messages: req.flash("error"),
    pageCss: null,
    error: errors.length > 0 ? errors[0] : null,
    success: successMessages.length > 0 ? successMessages[0] : null,
  });
});

router.post("/auth/register", AuthController.registerMember, (req, res) => {
  req.flash("success", "Đăng ký thành công! Vui lòng đăng nhập.");
  res.redirect("/auth/login");
});

router.get("/auth/login", (req, res) => {
  const errors = req.flash("error");
  const successMessages = req.flash("success");
  if (req.member) return res.redirect("/");
  res.render("auth/login", {
    title: "Đăng Nhập",
    messages: req.flash("error"),
    pageCss: null,
    error: errors.length > 0 ? errors[0] : null,
    success: successMessages.length > 0 ? successMessages[0] : null,
  });
});

router.post("/auth/login", AuthController.authMember);

router.get("/auth/logout", AuthController.logoutMember);

router.get("/profile", protect, async (req, res) => {
  res.render("/auth/profile", {
    title: "Thông Tin Cá Nhân",
    member: req.member,
    messages: req.flash("success"),
  });
});

router.post("/profile/update", protect, MemberController.updateMemberProfile);

router.post("/profile/password", protect, MemberController.changePassword);

router.post(
  "/perfumes/:perfumeId/comment",
  protect,
  CommentController.postComment,
  (req, res) => {
    req.flash("success", "Đã thêm bình luận và rating thành công!");
    res.redirect(`/perfumes/${req.params.perfumeId}`);
  }
);

router.get("/admin/dashboard", protect, admin, (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    member: req.member,
    loggedInUser: req.user || null,
    pageCss: null,
  });
});

router.get("/admin/manage_members", protect, admin, async (req, res, next) => {
  try {
    // SỬA: Gọi hàm tiện ích findAllMembers()
    const membersData = await MemberController.findAllMembers();

    res.render("admin/manage_members", {
      title: "Quản Lý Thành Viên",
      members: membersData || [],
      member: req.member,
      loggedInUser: req.user || null,
      pageCss: null,
    });
  } catch (error) {
    next(error);
  }
});

// Hiển thị danh sách thương hiệu
router.get("/admin/manage_brands", protect, admin, async (req, res, next) => {
  try {
    const brands = await BrandController.findAllBrands();
    res.render("admin/manage_brands", {
      title: "Quản Lý Thương Hiệu",
      brands,
      member: req.member,
      message: null,
      loggedInUser: req.user || null,
      pageCss: null,
    });
  } catch (error) {
    next(error);
  }
});

// Tạo thương hiệu (POST từ EJS form)
router.post("/admin/brands", protect, admin, async (req, res, next) => {
  try {
    await BrandController.createBrand(req, res, next);
    res.redirect("/admin/manage_brands");
  } catch (error) {
    next(error);
  }
});

// Cập nhật thương hiệu (dùng method-override)
router.put("/admin/brands/:brandId", protect, admin, async (req, res, next) => {
  try {
    await BrandController.updateBrand(req, res, next);
    res.redirect("/admin/manage_brands");
  } catch (error) {
    next(error);
  }
});

// Xóa thương hiệu
router.delete(
  "/admin/brands/:brandId",
  protect,
  admin,
  async (req, res, next) => {
    try {
      await BrandController.deleteBrand(req, res, next);
      res.redirect("/admin/manage_brands");
    } catch (error) {
      next(error);
    }
  }
);

router.get("/admin/manage_perfumes", protect, admin, async (req, res, next) => {
  try {
    const brands = await Brand.find().select("_id brandName").lean();
    const perfumesData = await PerfumeController.getPerfumes(req);
    res.render("admin/manage_perfumes", {
      title: "Quản Lý Nước Hoa",
      perfumes: perfumesData || [],
      brands: brands,
      member: req.member,
      loggedInUser: req.user || null,
      pageCss: null,
      message: null,
    });
  } catch (error) {
    next(error);
  }
});

// Tạo nước hoa (POST từ EJS form)
router.post(
  "/admin/perfumes",
  protect,
  admin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await PerfumeController.createPerfume(req, res, next);
      res.redirect("/admin/manage_perfumes");
    } catch (error) {
      next(error);
    }
  }
);

// Cập nhật nước hoa
router.put(
  "/admin/perfumes/:id",
  protect,
  admin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await PerfumeController.updatePerfume(req, res, next);
      res.redirect("/admin/manage_perfumes");
    } catch (error) {
      next(error);
    }
  }
);

// Xóa nước hoa
router.delete("/admin/perfumes/:id", protect, admin, async (req, res, next) => {
  try {
    await PerfumeController.deletePerfume(req, res, next);
    res.redirect("/admin/manage_perfumes");
  } catch (error) {
    next(error);
  }
});

router.get("/", getHome);
router.get("/perfumes/:id", getPerfumeDetails);

module.exports = router;
