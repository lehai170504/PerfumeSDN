const express = require("express");
const router = express.Router();

const { protect, checkLoggedIn, noCache } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const Brand = require("../models/Brand");
const AuthController = require("../controllers/authController");
const BrandController = require("../controllers/brandController");
const PerfumeController = require("../controllers/perfumeController");
const MemberController = require("../controllers/memberController");
const CommentController = require("../controllers/commentController");
const upload = require("../middleware/uploadMiddleware");
const Member = require("../models/Member");
const Perfume = require("../models/Perfume");

/* ===========================================
   🌸 TRANG CHỦ + PERFUME DETAIL
=========================================== */
const getHome = async (req, res, next) => {
  try {
    const brands = await Brand.find().select("_id brandName").lean();
    const perfumes = await PerfumeController.getPerfumes(req);

    const currentSearch = req.query.search || "";
    const currentBrandId = req.query.brandId || "";

    res.render("index", {
      title: "Trang chủ",
      loggedInUser: req.member,
      perfumes,
      brands,
      search: currentSearch,
      brandId: currentBrandId,
      pageCss: null,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    next(error);
  }
};

const getPerfumeDetails = async (req, res, next) => {
  try {
    const perfumeData = await PerfumeController.findPerfume(req.params.id);
    const loggedInUser = req.member;

    if (!perfumeData) {
      return res.status(404).render("404", { title: "Không tìm thấy" });
    }

    let hasCommented = false;

    if (loggedInUser && perfumeData.comments) {
      hasCommented = perfumeData.comments.some(
        (comment) =>
          comment.author &&
          comment.author._id.toString() === loggedInUser._id.toString()
      );
    }

    res.render("detail", {
      title: perfumeData.perfumeName,
      perfume: perfumeData,
      loggedInUser,
      hasCommented,
      pageCss: null,
      messages: null,
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================================
   🔐 AUTH ROUTES
=========================================== */
router.get("/auth/register", (req, res) => {
  if (req.member) return res.redirect("/");
  res.render("auth/register", {
    title: "Đăng Ký",
    pageCss: null,
  });
});

router.post("/auth/register", AuthController.registerMember);

router.get("/auth/login", noCache, checkLoggedIn, (req, res) => {
  res.render("auth/login", {
    title: "Đăng Nhập",
    pageCss: null,
    user: null,
  });
});

router.post("/auth/login", AuthController.authMember);
router.get("/auth/logout", AuthController.logoutMember);
router.post("/auth/admin", protect, admin, AuthController.createAdmin);

/* ===========================================
   👤 MEMBER ROUTES
=========================================== */
router.get("/member/profile", protect, async (req, res) => {
  res.render("member/profile", {
    title: "Thông Tin Cá Nhân",
    member: req.member,
    loggedInUser: req.member || null,
    pageCss: "profile.css",
  });
});

router.put(
  "/member/profile/:id",
  protect,
  MemberController.updateMemberProfile
);
router.put("/member/password", protect, MemberController.changePassword);

/* ===========================================
   🧭 ADMIN DASHBOARD
=========================================== */
router.get("/admin/dashboard", protect, admin, (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    loggedInUser: req.member || null,
    pageCss: null,
  });
});

/* ===========================================
   👥 QUẢN LÝ THÀNH VIÊN
=========================================== */
router.get("/admin/manage_members", protect, admin, async (req, res, next) => {
  try {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    const totalMembers = await Member.countDocuments();
    const membersData = await Member.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const successMessages = req.flash("success");
    const errorMessages = req.flash("error");

    res.render("admin/manage_members", {
      title: "Quản Lý Thành Viên",
      members: membersData || [],
      loggedInUser: req.member || null,
      member: req.member,
      pageCss: null,
      messages: {
        success: successMessages,
        error: errorMessages,
      },
      currentPage: page,
      totalPages: Math.ceil(totalMembers / perPage),
    });
  } catch (error) {
    next(error);
  }
});

// 🗑️ [Admin] Xóa mềm / Ẩn thành viên
router.delete("/:memberId", protect, admin, MemberController.deleteMember);

/* ===========================================
   🏷️ QUẢN LÝ THƯƠNG HIỆU
=========================================== */
router.get("/admin/manage_brands", protect, admin, async (req, res, next) => {
  try {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    const totalBrands = await Brand.countDocuments();
    const brands = await Brand.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render("admin/manage_brands", {
      title: "Quản Lý Thương Hiệu",
      brands,
      currentPage: page,
      totalPages: Math.ceil(totalBrands / perPage),
      loggedInUser: req.member || null,
      pageCss: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/brands", protect, admin, async (req, res, next) => {
  try {
    await BrandController.createBrand(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("/admin/brands/:brandId", protect, admin, async (req, res, next) => {
  try {
    await BrandController.updateBrand(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/admin/brands/:brandId",
  protect,
  admin,
  async (req, res, next) => {
    try {
      await BrandController.deleteBrand(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/* ===========================================
   💐 QUẢN LÝ NƯỚC HOA
=========================================== */
router.get("/admin/manage_perfumes", protect, admin, async (req, res, next) => {
  try {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;
    const brands = await Brand.find().select("_id brandName").lean();
    const totalPerfumes = await Perfume.countDocuments();

    const perfumes = await Perfume.find()
      .populate("brand", "brandName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    res.render("admin/manage_perfumes", {
      title: "Quản Lý Nước Hoa",
      perfumes,
      brands,
      currentPage: page,
      totalPages: Math.ceil(totalPerfumes / perPage),
      loggedInUser: req.member || null,
      pageCss: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/admin/perfumes",
  protect,
  admin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await PerfumeController.createPerfume(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/admin/perfumes/:id",
  protect,
  admin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await PerfumeController.updatePerfume(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/admin/perfumes/:id", protect, admin, async (req, res, next) => {
  try {
    await PerfumeController.deletePerfume(req, res);
  } catch (error) {
    next(error);
  }
});

/* ===========================================
   💬 COMMENT ROUTES
=========================================== */
router.get("/", getHome);
router.get("/perfumes/:id", getPerfumeDetails);

router.post(
  "/perfumes/:perfumeId/comment",
  protect,
  CommentController.postComment
);
router.put(
  "/perfumes/:perfumeId/comment/:commentId",
  protect,
  CommentController.updateComment
);
router.delete(
  "/perfumes/:perfumeId/comment/:commentId",
  protect,
  CommentController.deleteComment
);

module.exports = router;
