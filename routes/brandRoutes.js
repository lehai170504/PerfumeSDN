// routes/brandRouter.js
const express = require("express");
const brandController = require("../controllers/brandController");

// Import Middleware và Validation Schemas
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const {
  createBrandSchema,
  updateBrandSchema,
} = require("../validations/brand/brand.schema");

const brandRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Quản lý các Thương hiệu (Brand)
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Lấy danh sách tất cả thương hiệu
 *     tags: [Brands]
 *     responses:
 *       '200':
 *         description: Danh sách thương hiệu được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 652fc9f7acb123456789abcd
 *                   brandName:
 *                     type: string
 *                     example: Chanel
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       '500':
 *         description: Lỗi server
 *   post:
 *     summary: Tạo một thương hiệu mới (Chỉ Admin)
 *     tags: [Brands]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: Gucci
 *     responses:
 *       '201':
 *         description: Thương hiệu được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 652fc9f7acb123456789abcd
 *                 brandName:
 *                   type: string
 *                   example: Gucci
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Dữ liệu không hợp lệ (Validation Error)
 *       '401':
 *         description: Chưa xác thực (Missing Token)
 *       '403':
 *         description: Không có quyền Admin
 */
brandRouter
  .route("/")
  .get(brandController.getAllBrands)
  .post(
    protect,
    admin,
    validate(createBrandSchema, "body"),
    brandController.createBrand
  );

/**
 * @swagger
 * /brands/{brandId}:
 *   get:
 *     summary: Lấy thông tin một thương hiệu bằng ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của thương hiệu
 *     responses:
 *       '200':
 *         description: Thông tin thương hiệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 652fc9f7acb123456789abcd
 *                 brandName:
 *                   type: string
 *                   example: Dior
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Không tìm thấy thương hiệu
 *   put:
 *     summary: Cập nhật thông tin thương hiệu (Chỉ Admin)
 *     tags: [Brands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của thương hiệu cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: Dior Updated
 *     responses:
 *       '200':
 *         description: Cập nhật thành công
 *       '400':
 *         description: Dữ liệu không hợp lệ
 *       '403':
 *         description: Không có quyền Admin
 *       '404':
 *         description: Không tìm thấy thương hiệu
 *   delete:
 *     summary: Xóa một thương hiệu (Chỉ Admin)
 *     tags: [Brands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của thương hiệu cần xóa
 *     responses:
 *       '200':
 *         description: Xóa thành công
 *       '403':
 *         description: Không có quyền Admin
 *       '404':
 *         description: Không tìm thấy thương hiệu
 */
brandRouter
  .route("/:brandId")
  .get(brandController.getBrandById)
  .put(
    protect,
    admin,
    validate(updateBrandSchema, "body"),
    brandController.updateBrand
  )
  .delete(protect, admin, brandController.deleteBrand);

module.exports = brandRouter;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
