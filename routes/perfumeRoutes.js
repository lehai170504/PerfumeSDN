const express = require("express");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const validate = require("../middleware/validate");

const {
  getPerfumes,
  getPerfumeById,
  createPerfume,
  updatePerfume,
  deletePerfume,
  searchPerfumes,
  getPerfumesByBrand,
} = require("../controllers/perfumeController");

const createPerfumeSchema = require("../validations/perfume/createPerfume.schema");
const editPerfumeSchema = require("../validations/perfume/updatePerfume.schema");
const commentRouter = require("./commentRoutes");

const router = express.Router();

router.use("/:perfumeId/comments", commentRouter);

/**
 * @swagger
 * tags:
 *   name: Perfumes
 *   description: API quản lý nước hoa
 */

/**
 * @swagger
 * /perfumes:
 *   get:
 *     summary: Lấy danh sách tất cả nước hoa
 *     tags: [Perfumes]
 *     responses:
 *       200:
 *         description: Danh sách nước hoa
 *   post:
 *     summary: Tạo mới nước hoa (Admin only)
 *     tags: [Perfumes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePerfume'
 *     responses:
 *       201:
 *         description: Tạo mới nước hoa thành công
 */
router
  .route("/")
  .get(getPerfumes)
  .post(protect, admin, validate(createPerfumeSchema), createPerfume);

/**
 * @swagger
 * /perfumes/search:
 *   get:
 *     summary: Tìm kiếm nước hoa theo tên, mô tả hoặc thương hiệu
 *     tags: [Perfumes]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 *       400:
 *         description: Thiếu từ khóa tìm kiếm
 *       500:
 *         description: Lỗi server
 */
router.get("/search", searchPerfumes);

/**
 * @swagger
 * /perfumes/brand/{brandId}:
 *   get:
 *     summary: Lấy danh sách nước hoa theo thương hiệu
 *     tags: [Perfumes]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thương hiệu
 *     responses:
 *       200:
 *         description: Danh sách nước hoa theo thương hiệu
 *       400:
 *         description: ID không hợp lệ hoặc thiếu
 *       500:
 *         description: Lỗi server
 */
router.get("/brand/:brandId", getPerfumesByBrand);

/**
 * @swagger
 * /perfumes/{id}:
 *   get:
 *     summary: Lấy chi tiết nước hoa theo ID
 *     tags: [Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết nước hoa
 *       404:
 *         description: Không tìm thấy nước hoa
 *   put:
 *     summary: Cập nhật thông tin nước hoa (Admin only)
 *     tags: [Perfumes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditPerfume'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Chỉ admin mới được phép
 *   delete:
 *     summary: Xóa nước hoa (Admin only)
 *     tags: [Perfumes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Chỉ admin mới được phép
 */
router
  .route("/:id")
  .get(getPerfumeById)
  .put(protect, admin, validate(editPerfumeSchema), updatePerfume)
  .delete(protect, admin, deletePerfume);

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePerfume:
 *       type: object
 *       required:
 *         - perfumeName
 *         - uri
 *         - price
 *         - concentration
 *         - description
 *         - volume
 *         - targetAudience
 *         - brand
 *       properties:
 *         perfumeName:
 *           type: string
 *           example: "Chanel Coco Mademoiselle"
 *         uri:
 *           type: string
 *           example: "chanel-coco-mademoiselle"
 *         price:
 *           type: number
 *           example: 3200000
 *         concentration:
 *           type: string
 *           enum: [EDT, EDP, Parfum, Cologne]
 *           example: "EDP"
 *         description:
 *           type: string
 *           example: "Một mùi hương tinh tế và quyến rũ dành cho phụ nữ hiện đại."
 *         ingredients:
 *           type: string
 *           example: "Cam bergamot, hoa hồng, hoắc hương"
 *         volume:
 *           type: integer
 *           example: 100
 *         targetAudience:
 *           type: string
 *           enum: [Nam, Nữ, Unisex]
 *           example: "Nữ"
 *         brand:
 *           type: string
 *           example: "66f3c52a12b4e5d4c8719a2b"
 *     EditPerfume:
 *       type: object
 *       properties:
 *         perfumeName:
 *           type: string
 *           example: "Dior Homme Intense"
 *         price:
 *           type: number
 *           example: 2800000
 *         concentration:
 *           type: string
 *           enum: [EDT, EDP, Parfum, Cologne]
 *         description:
 *           type: string
 *           example: "Hương thơm nam tính, thanh lịch và mạnh mẽ."
 *         ingredients:
 *           type: string
 *           example: "Hoa oải hương, diên vĩ, gỗ tuyết tùng"
 *         volume:
 *           type: integer
 *           example: 75
 *         targetAudience:
 *           type: string
 *           enum: [Nam, Nữ, Unisex]
 *         brand:
 *           type: string
 *           example: "66f3c52a12b4e5d4c8719a2b"
 */

module.exports = router;
