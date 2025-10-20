// File: ../controllers/commentController.js

const Perfume = require("../models/Perfume");
const Comment = require("../models/Comment");
const sendResponse = require("../middleware/responseHandler");

const checkSingleFeedback = async (req, res, next) => {
  try {
    // 1. Tìm Perfume để đảm bảo nó tồn tại
    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      return sendResponse(res, 404, false, "Perfume not found");
    }

    const existingComment = await Comment.findOne({
      author: req.member._id,
      _id: { $in: perfume.comments },
    });

    if (existingComment) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden: You have already commented on this perfume."
      );
    }

    req.perfume = perfume;
    next();
  } catch (err) {
    next(err);
  }
};

// --- Controller Functions ---

// POST /perfumes/:perfumeId/comments - Gửi comment mới (Member Only)
exports.postComment = [
  checkSingleFeedback,
  async (req, res, next) => {
    try {
      const perfume = req.perfume;

      // Kiểm tra và validate dữ liệu
      if (!req.body.rating || req.body.rating < 1 || req.body.rating > 3) {
        return sendResponse(res, 400, false, "Rating must be between 1 and 3.");
      }
      if (!req.body.content) {
        return sendResponse(res, 400, false, "Comment content is required.");
      }

      const newComment = new Comment({
        rating: req.body.rating,
        content: req.body.content,
        author: req.member._id,
      });

      const savedComment = await newComment.save();
      perfume.comments.push(savedComment._id);
      await perfume.save();

      // Trả về comment đã tạo
      return sendResponse(
        res,
        201,
        true,
        "Comment posted successfully",
        savedComment
      );
    } catch (err) {
      next(err);
    }
  },
];

// PUT /perfumes/:perfumeId/comments/:commentId - Chỉnh sửa comment của chính mình
exports.updateComment = async (req, res, next) => {
  try {
    const { perfumeId, commentId } = req.params;
    const isJsonRequest = req.headers.accept?.includes("json");

    // 1. Tìm và xác thực quyền sở hữu Comment
    const comment = await Comment.findOne({
      _id: commentId,
      author: req.member._id, // Đảm bảo người dùng hiện tại là tác giả
    });

    if (!comment) {
      const message = "Comment not found or access denied.";
      if (isJsonRequest) {
        return sendResponse(res, 404, false, message);
      } else {
        req.flash("error", message);
        return res.redirect(`/perfumes/${perfumeId}`);
      }
    }

    // 2. Xác thực Comment có thuộc về Perfume này
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume || !perfume.comments.includes(commentId)) {
      const message = "Comment not linked to this perfume.";
      if (isJsonRequest) {
        return sendResponse(res, 404, false, message);
      } else {
        req.flash("error", message);
        return res.redirect(`/perfumes/${perfumeId}`);
      }
    }

    // 3. Validation và Cập nhật Rating
    if (req.body.rating !== undefined) {
      const rating = parseInt(req.body.rating);
      if (rating < 1 || rating > 3 || isNaN(rating)) {
        const message = "Rating must be between 1 and 3.";
        if (isJsonRequest) {
          return sendResponse(res, 400, false, message);
        } else {
          req.flash("error", message);
          return res.redirect(`/perfumes/${perfumeId}`);
        }
      }
      comment.rating = rating;
    }

    // 4. Cập nhật Content
    if (req.body.content !== undefined) {
      comment.content = req.body.content;
    }

    // 5. Lưu và Phản hồi
    await comment.save();

    const successMessage = "Comment updated successfully";
    if (isJsonRequest) {
      return sendResponse(res, 200, true, successMessage, comment);
    } else {
      req.flash("success", successMessage);
      return res.redirect(`/perfumes/${perfumeId}#feedback-section`);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /perfumes/:perfumeId/comments/:commentId - Xóa comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { perfumeId, commentId } = req.params;
    const isJsonRequest = req.headers.accept?.includes("json");
    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      author: req.member._id,
    });

    if (!deletedComment) {
      const message = "Comment not found or access denied.";
      if (isJsonRequest) {
        return sendResponse(res, 404, false, message);
      } else {
        req.flash("error", message);
        return res.redirect(`/perfumes/${perfumeId}`);
      }
    }

    // 2. Xóa tham chiếu comment khỏi Perfume
    const perfume = await Perfume.findById(perfumeId);
    if (perfume) {
      // Sử dụng .pull() của Mongoose để loại bỏ ID khỏi mảng
      perfume.comments.pull(commentId);
      await perfume.save();
    }

    // 3. Phản hồi
    const successMessage = "Comment deleted successfully";
    if (isJsonRequest) {
      // Phản hồi thành công cho API
      return sendResponse(res, 200, true, successMessage);
    } else {
      // Phản hồi thành công cho Web/EJS
      req.flash("success", successMessage);
      return res.redirect(`/perfumes/${perfumeId}#feedback-section`);
    }
  } catch (err) {
    next(err);
  }
};
