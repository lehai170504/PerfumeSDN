const express = require("express");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const {
  getPerfumes,
  getPerfumeById,
  createPerfume,
  updatePerfume,
  deletePerfume,
} = require("../controllers/perfumeController");

const router = express.Router();

// Public: Index, Search, Filter
router.route("/").get(getPerfumes); // GET all perfumes (population brandName) [cite: 65]

// Admin: POST
router.route("/").post(protect, admin, createPerfume); // POST (tạo mới) [cite: 56]

// Public: Detail
router.route("/:id").get(getPerfumeById); // GET detailed route (with comment population) [cite: 66]

// Admin: PUT, DELETE
router
  .route("/:id")
  .put(protect, admin, updatePerfume)
  .delete(protect, admin, deletePerfume); // PUT/DELETE [cite: 56]

module.exports = router;
