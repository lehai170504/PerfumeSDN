const express = require("express");
const {
  registerMember,
  authMember,
  logoutMember,
  createAdmin,
} = require("../controllers/authController");
const router = express.Router();

// Import Middleware và Validation Schemas
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
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
 * /auth/admin:
 *   post:
 *     summary: Tạo tài khoản Admin mới (Chỉ Admin mới được phép gọi)
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []  # Yêu cầu Cookie/Token để xác thực
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
 *                 example: Admin Nguyễn
 *               email:
 *                 type: string
 *                 format: email
 *                 example: new.admin@domain.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: AdminPass123
 *               YOB:
 *                 type: number
 *                 example: 1990
 *               gender:
 *                 type: string
 *                 example: male
 *     responses:
 *       '201':
 *         description: Tạo Admin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     email:
 *                       type: string
 *                       example: new.admin@domain.com
 *                     isAdmin:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Email đã được sử dụng hoặc dữ liệu không hợp lệ
 *       '403':
 *         description: Không được cấp phép. Chỉ dành cho Admin.
 */

router.post("/admin", protect, admin, validate(registerSchema), createAdmin);

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
router.post("/logout", logoutMember);

module.exports = router;
