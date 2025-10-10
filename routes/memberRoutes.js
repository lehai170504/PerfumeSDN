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

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: API quản lý thành viên
 */

/**
 * @swagger
 * /members/collectors:
 *   get:
 *     summary: Lấy danh sách tất cả member (Admin only)
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       name:
 *                         type: string
 *                         example: "Nguyễn Văn A"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       YOB:
 *                         type: integer
 *                         example: 1998
 *                       gender:
 *                         type: string
 *                         example: "Male"
 *                       isAdmin:
 *                         type: boolean
 *                         example: false
 *                 message:
 *                   type: string
 *                   example: "Fetched members successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - chỉ Admin mới được phép
 */
router.get("/collectors", protect, admin, getAllMembers);

/**
 * @swagger
 * /members/profile:
 *   get:
 *     summary: Lấy thông tin profile của member hiện tại
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Member profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     name:
 *                       type: string
 *                       example: "Nguyễn Văn A"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     YOB:
 *                       type: integer
 *                       example: 1998
 *                     gender:
 *                       type: string
 *                       example: "Male"
 *                     isAdmin:
 *                       type: boolean
 *                       example: false
 *                 message:
 *                   type: string
 *                   example: "Fetched member profile successfully"
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Cập nhật profile của member hiện tại
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn B"
 *               YOB:
 *                 type: integer
 *                 example: 2000
 *               gender:
 *                 type: string
 *                 example: "Male"
 *     responses:
 *       200:
 *         description: Profile updated thành công
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router
  .route("/profile")
  .get(protect, getMemberProfile)
  .put(protect, updateMemberProfile);

/**
 * @swagger
 * /members/password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized
 */
router.put("/password", protect, changePassword);

module.exports = router;
