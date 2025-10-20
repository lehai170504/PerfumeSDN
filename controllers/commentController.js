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
    const isAPIRequest = req.headers.accept?.includes("json");
    const perfumeId = req.perfume ? req.perfume._id : req.params.perfumeId;

    try {
      // 0. Kiểm tra ID
      if (!perfumeId) {
        const message = "Không tìm thấy ID nước hoa để đăng bình luận.";
        if (isAPIRequest) {
          return sendResponse(res, 400, false, message);
        } else {
          req.flash("error", message);
          return res.redirect("back");
        }
      }

      // 1. Chỉ cho phép member
      if (!req.member || req.member.isAdmin === true) {
        const message = "Chỉ thành viên mới được phép đăng bình luận.";
        if (isAPIRequest) return sendResponse(res, 403, false, message);
        req.flash("error", message);
        return res.redirect(`/perfumes/${perfumeId}`);
      }

      // 2. Kiểm tra rating
      const rating = parseInt(req.body.rating);
      if (!rating || rating < 1 || rating > 3) {
        const message = "Rating phải nằm trong khoảng từ 1 đến 3.";
        if (isAPIRequest) return sendResponse(res, 400, false, message);
        req.flash("error", message);
        return res.redirect(`/perfumes/${perfumeId}`);
      }

      // 3. Kiểm tra nội dung
      if (!req.body.content) {
        const message = "Nội dung bình luận là bắt buộc.";
        if (isAPIRequest) return sendResponse(res, 400, false, message);
        req.flash("error", message);
        return res.redirect(`/perfumes/${perfumeId}`);
      }

      // 4. Lấy perfume
      const perfume = await Perfume.findById(perfumeId);
      if (!perfume) {
        const message = "Không tìm thấy nước hoa.";
        if (isAPIRequest) return sendResponse(res, 404, false, message);
        req.flash("error", message);
        return res.redirect("back");
      }

      // 5. Lưu comment
      const newComment = new Comment({
        rating,
        content: req.body.content,
        author: req.member._id,
      });

      const savedComment = await newComment.save();
      perfume.comments.push(savedComment._id);
      await perfume.save();

      const successMessage = "Đăng bình luận thành công.";
      if (isAPIRequest) {
        return sendResponse(res, 201, true, successMessage, savedComment);
      } else {
        req.flash("success", successMessage);
        return res.redirect(`/perfumes/${perfumeId}#feedback-section`);
      }
    } catch (err) {
      console.error("❌ Lỗi khi đăng bình luận:", err);
      if (isAPIRequest) next(err);
      else {
        req.flash("error", "Đã xảy ra lỗi hệ thống khi đăng bình luận.");
        return res.redirect("back");
      }
    }
  },
];

// PUT /perfumes/:perfumeId/comments/:commentId - Chỉnh sửa comment của chính mình
exports.updateComment = async (req, res, next) => {
  try {
    const { perfumeId, commentId } = req.params;
    const isJsonRequest = req.headers.accept?.includes("json");

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.member._id,
    });

    if (!comment) {
      const message =
        "Bình luận không tìm thấy hoặc quyền truy cập bị từ chối.";
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
      const message = "Bình luận không liên kết với nước hoa này.";
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
        const message = "Đánh giá phải từ 1 đến 3.";
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

    const successMessage = "Bình luận được cập nhật thành công.";
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
      const message =
        "Bình luận không tìm thấy hoặc quyền truy cập bị từ chối.";
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
    const successMessage = "Bình luận được xóa thành công.";
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
