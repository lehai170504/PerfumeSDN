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
// UPDATE comment
exports.updateComment = async (req, res, next) => {
  try {
    const { perfumeId, commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.member._id,
    });

    if (!comment) {
      if (req.headers.accept?.includes("json")) {
        return sendResponse(
          res,
          404,
          false,
          "Comment not found or access denied."
        );
      } else {
        req.flash("error", "Comment not found or access denied.");
        return res.redirect(`/perfumes/${perfumeId}`);
      }
    }

    const perfume = await Perfume.findById(perfumeId);
    if (!perfume || !perfume.comments.includes(commentId)) {
      if (req.headers.accept?.includes("json")) {
        return sendResponse(
          res,
          404,
          false,
          "Comment not linked to this perfume."
        );
      } else {
        req.flash("error", "Comment not linked to this perfume.");
        return res.redirect(`/perfumes/${perfumeId}`);
      }
    }

    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 3) {
        if (req.headers.accept?.includes("json")) {
          return sendResponse(
            res,
            400,
            false,
            "Rating must be between 1 and 3."
          );
        } else {
          req.flash("error", "Rating must be between 1 and 3.");
          return res.redirect(`/perfumes/${perfumeId}`);
        }
      }
      comment.rating = req.body.rating;
    }
    if (req.body.content !== undefined) {
      comment.content = req.body.content;
    }

    await comment.save();

    if (req.headers.accept?.includes("json")) {
      return sendResponse(
        res,
        200,
        true,
        "Comment updated successfully",
        comment
      );
    } else {
      req.flash("success", "Comment updated successfully");
      return res.redirect(`/perfumes/${perfumeId}#feedback-section`);
    }
  } catch (err) {
    next(err);
  }
};

// DELETE comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { perfumeId, commentId } = req.params;

    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      author: req.member._id,
    });

    if (!deletedComment) {
      if (req.headers.accept?.includes("json")) {
        return sendResponse(
          res,
          404,
          false,
          "Comment not found or access denied."
        );
      } else {
        req.flash("error", "Comment not found or access denied.");
        return res.redirect(`/perfumes/${perfumeId}`);
      }
    }

    const perfume = await Perfume.findById(perfumeId);
    if (perfume) {
      perfume.comments.pull(commentId);
      await perfume.save();
    }

    if (req.headers.accept?.includes("json")) {
      return sendResponse(res, 200, true, "Comment deleted successfully");
    } else {
      req.flash("success", "Comment deleted successfully");
      return res.redirect(`/perfumes/${perfumeId}#feedback-section`);
    }
  } catch (err) {
    next(err);
  }
};
