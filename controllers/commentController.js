// File: ../controllers/commentController.js

const Perfume = require("../models/Perfume");
const sendResponse = require("../middleware/responseHandler"); // Hàm tiện ích

const checkSingleFeedback = async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      return sendResponse(res, 404, false, "Perfume not found");
    }

    // Tìm comment có author là ID của người dùng hiện tại (req.member._id)
    const existingComment = perfume.comments.find(
      (comment) => comment.author.toString() === req.member._id.toString()
    );

    if (existingComment) {
      // Nếu đã tìm thấy comment, cấm gửi thêm
      return sendResponse(
        res,
        403,
        false,
        "Forbidden: You have already commented on this perfume."
      );
    }

    // Gắn perfume vào req để tránh tìm kiếm lại
    req.perfume = perfume;
    next(); // Cho phép tiếp tục nếu chưa có comment
  } catch (err) {
    next(err);
  }
};

// --- Controller Functions ---

// POST /perfumes/:perfumeId/comments - Gửi comment mới (Member Only)
exports.postComment = [
  // checkSingleFeedback được chạy sau middleware 'protect'
  checkSingleFeedback,
  async (req, res, next) => {
    try {
      const perfume = req.perfume;

      // Kiểm tra và validate dữ liệu
      if (!req.body.rating || req.body.rating < 1 || req.body.rating > 3) {
        return sendResponse(res, 400, false, "Rating must be between 1 and 3."); // Theo commentSchema: min: 1, max: 3 [cite: 38]
      }
      if (!req.body.content) {
        return sendResponse(res, 400, false, "Comment content is required.");
      }

      const newComment = {
        rating: req.body.rating,
        content: req.body.content,
        author: req.member._id, // ID Member từ middleware protect
      };

      perfume.comments.push(newComment);
      await perfume.save();

      const createdComment = perfume.comments[perfume.comments.length - 1];

      return sendResponse(
        res,
        201,
        true,
        "Comment posted successfully",
        createdComment
      );
    } catch (err) {
      next(err);
    }
  },
];

// PUT /perfumes/:perfumeId/comments/:commentId - Chỉnh sửa comment của chính mình (Author Only)
exports.updateComment = async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      return sendResponse(res, 404, false, "Perfume not found");
    }

    const comment = perfume.comments.id(req.params.commentId);
    if (!comment) {
      return sendResponse(res, 404, false, "Comment not found");
    }

    // Kiểm tra quyền: Chỉ tác giả mới được chỉnh sửa
    if (comment.author.toString() !== req.member._id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden: You can only edit your own comments."
      );
    }

    // Cập nhật thông tin
    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 3) {
        return sendResponse(res, 400, false, "Rating must be between 1 and 3.");
      }
      comment.rating = req.body.rating;
    }
    if (req.body.content !== undefined) {
      comment.content = req.body.content;
    }

    await perfume.save();
    return sendResponse(
      res,
      200,
      true,
      "Comment updated successfully",
      comment
    );
  } catch (err) {
    next(err);
  }
};

// DELETE /perfumes/:perfumeId/comments/:commentId - Xóa comment của chính mình (Author Only)
exports.deleteComment = async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      return sendResponse(res, 404, false, "Perfume not found");
    }

    const comment = perfume.comments.id(req.params.commentId);
    if (!comment) {
      return sendResponse(res, 404, false, "Comment not found");
    }

    // Kiểm tra quyền: Chỉ tác giả mới được xóa
    if (comment.author.toString() !== req.member._id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden: You can only delete your own comments."
      );
    }

    // Xóa sub-document và lưu
    comment.remove();
    await perfume.save();

    return sendResponse(res, 200, true, "Comment deleted successfully");
  } catch (err) {
    next(err);
  }
};
