const express = require("express");
const { registerMember, authMember } = require("../controllers/authController");
const router = express.Router();

// Import Middleware và Validation Schemas
const validate = require("../middleware/validate");

const { registerSchema, loginSchema } = require("../validations/auth");

// ----------------------------------------------------

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký thành viên mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       '201':
 *         description: Đăng ký thành công, trả về token JWT và thông tin thành viên
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     name:
 *                       type: string
 *                       example: Nguyễn Văn A
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       '400':
 *         description: Member đã tồn tại hoặc dữ liệu không hợp lệ (lỗi validation chi tiết)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email đã tồn tại hoặc dữ liệu không hợp lệ
 */
router.post("/register", validate(registerSchema), registerMember);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập thành viên và nhận JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: haile170504@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: lehoanghai170504
 *     responses:
 *       '200':
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     name:
 *                       type: string
 *                       example: Nguyễn Văn A
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       '401':
 *         description: Email hoặc mật khẩu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email hoặc mật khẩu không hợp lệ
 */
router.post("/login", validate(loginSchema), authMember);

module.exports = router;
