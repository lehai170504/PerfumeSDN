const express = require("express");
const { registerMember, authMember } = require("../controllers/authController");
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Đăng ký thành viên mới
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/MemberRegister'
 * responses:
 * '201':
 * description: Đăng ký thành công, trả về token JWT
 * '400':
 * description: Member đã tồn tại hoặc dữ liệu không hợp lệ
 */
router.post("/register", registerMember);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Đăng nhập thành viên và nhận JWT token
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/MemberLogin'
 * responses:
 * '200':
 * description: Đăng nhập thành công
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AuthResponse'
 * '401':
 * description: Email hoặc mật khẩu không hợp lệ
 */
router.post("/login", authMember);

module.exports = router;
