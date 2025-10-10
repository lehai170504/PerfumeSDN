const express = require("express");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const {
  getAllMembers,
  getMemberProfile,
  updateMemberProfile,
  changePassword,
} = require("../controllers/memberController");

const router = express.Router();

// Task 4: Admin get all members (collectors)
router.route("/collectors").get(protect, admin, getAllMembers); // Task 4: Admin-only GET

// Member management
router
  .route("/profile")
  .get(protect, getMemberProfile)
  // Task 1: Member update his/her own profile & change password [cite: 59, 71, 72]
  .put(protect, updateMemberProfile);

router.route("/password").put(protect, changePassword);

module.exports = router;
