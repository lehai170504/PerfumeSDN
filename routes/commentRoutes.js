const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const commentController = require("../controllers/commentController");
const validate = require("../middleware/validate");
const commentSchema = require("../validations/comment/comment.schema");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API quản lý bình luận (sub-document) cho nước hoa
 */

/**
 * @swagger
 * /perfumes/{perfumeId}/comments:
 *   post:
 *     summary: Thêm bình luận và đánh giá mới cho nước hoa (Member Only, 1 comment/perfume)
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nước hoa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Bình luận được đăng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ (Rating ngoài 1–3 hoặc thiếu Content)
 *       401:
 *         description: Unauthorized - Không có token hoặc token không hợp lệ
 *       403:
 *         description: Member đã bình luận về nước hoa này rồi
 */
router.post(
  "/",
  protect,
  validate(commentSchema),
  commentController.postComment
);

/**
 * @swagger
 * /perfumes/{perfumeId}/comments/{commentId}:
 *   put:
 *     summary: Chỉnh sửa bình luận và đánh giá của mình (Author Only)
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nước hoa
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận cần chỉnh sửa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       200:
 *         description: Bình luận được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Không phải tác giả của bình luận
 *       404:
 *         description: Không tìm thấy nước hoa hoặc bình luận
 */
router.put(
  "/:commentId",
  protect,
  validate(commentSchema),
  commentController.updateComment
);

/**
 * @swagger
 * /perfumes/{perfumeId}/comments/{commentId}:
 *   delete:
 *     summary: Xóa bình luận của mình (Author Only)
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nước hoa
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận cần xóa
 *     responses:
 *       200:
 *         description: Bình luận được xóa thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Không phải tác giả của bình luận
 *       404:
 *         description: Không tìm thấy nước hoa hoặc bình luận
 */
router.delete("/:commentId", protect, commentController.deleteComment);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CommentInput:
 *       type: object
 *       required:
 *         - rating
 *         - content
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 3
 *           example: 3
 *           description: Điểm đánh giá từ 1 đến 3
 *         content:
 *           type: string
 *           example: "Đây là mùi hương tuyệt vời nhất tôi từng thử."
 *           description: Nội dung bình luận
 */
