const Member = require("../models/Member");
const sendResponse = require("../middleware/responseHandler");
const bcrypt = require("bcrypt");

// [Admin] Lấy tất cả members (collectors)
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().select("-password");
    return sendResponse(res, 200, true, "Danh sách thành viên", members);
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

const findAllMembers = async () => {
  try {
    const members = await Member.find().select("-password");
    return members;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách thành viên:", error);
    return [];
  }
};

// [Member] Lấy profile cá nhân
const getMemberProfile = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id).select("-password");
    if (!member) {
      return sendResponse(res, 404, false, "Không tìm thấy thành viên");
    }
    return sendResponse(res, 200, true, "Thông tin cá nhân", member);
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

const updateMemberProfile = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id);

    if (!member) {
      // Nếu không tìm thấy member
      if (req.headers.accept?.includes("text/html")) {
        // Nếu đến từ form EJS
        req.flash("error", "Không tìm thấy thành viên!");
        return res.redirect("/member/profile");
      }
      return sendResponse(res, 404, false, "Không tìm thấy thành viên");
    }

    // Cập nhật thông tin
    member.name = req.body.name || member.name;
    member.email = req.body.email || member.email;
    member.YOB = req.body.YOB || member.YOB;
    member.gender =
      req.body.gender !== undefined ? req.body.gender : member.gender;

    const updatedMember = await member.save();

    // Nếu yêu cầu từ EJS form
    if (req.headers.accept?.includes("text/html")) {
      req.flash("success", "Cập nhật thông tin thành công!");
      return res.redirect("/member/profile");
    }

    // Nếu là API JSON
    return sendResponse(res, 200, true, "Cập nhật profile thành công", {
      id: updatedMember._id,
      name: updatedMember.name,
      email: updatedMember.email,
      YOB: updatedMember.YOB,
      gender: updatedMember.gender,
      isAdmin: updatedMember.isAdmin,
    });
  } catch (error) {
    if (req.headers.accept?.includes("text/html")) {
      req.flash("error", "Lỗi server! Vui lòng thử lại sau.");
      return res.redirect("/member/profile");
    }
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findByIdAndUpdate(
      memberId,
      { isDeleted: true },
      { new: true }
    );

    if (!member) {
      const notFoundMessage = "Không tìm thấy thành viên để xóa/ẩn.";
      if (req.headers.accept?.includes("text/html")) {
        req.flash("error", notFoundMessage);
        return res.redirect("/admin/manage_members");
      }
      return sendResponse(res, 404, false, notFoundMessage);
    }

    const successMessage = `Ẩn/Xóa mềm thành viên ${member.name} thành công.`;

    if (req.headers.accept?.includes("text/html")) {
      req.flash("success", successMessage);
      return res.redirect("/admin/manage_members");
    }
    return sendResponse(res, 200, true, successMessage);
  } catch (error) {
    if (error.name === "CastError") {
      const castErrorMessage = "ID thành viên không hợp lệ.";
      if (req.headers.accept?.includes("text/html")) {
        req.flash("error", castErrorMessage);
        return res.redirect("/admin/manage_members");
      }
      return sendResponse(res, 400, false, castErrorMessage);
    }

    if (req.headers.accept?.includes("text/html")) {
      req.flash("error", "Lỗi server! Vui lòng thử lại sau.");
      return res.redirect("/admin/manage_members");
    }
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      if (req.headers.accept?.includes("text/html")) {
        req.flash("error", "Mật khẩu mới và xác nhận mật khẩu không khớp!");
        return res.redirect("/member/profile");
      }
      return sendResponse(
        res,
        400,
        false,
        "Mật khẩu mới và xác nhận mật khẩu không khớp"
      );
    }
    const member = await Member.findById(req.member._id);

    if (!member) {
      if (req.headers.accept?.includes("text/html")) {
        req.flash("error", "Không tìm thấy thành viên!");
        return res.redirect("/member/profile");
      }
      return sendResponse(res, 404, false, "Không tìm thấy thành viên");
    }

    const isMatch = await member.matchPassword(currentPassword);
    if (!isMatch) {
      if (req.headers.accept?.includes("text/html")) {
        req.flash("error", "Mật khẩu hiện tại không đúng!");
        return res.redirect("/member/profile");
      }
      return sendResponse(res, 400, false, "Mật khẩu hiện tại không đúng");
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    member.password = await bcrypt.hash(newPassword, salt);
    await member.save();

    if (req.headers.accept?.includes("text/html")) {
      req.flash("success", "Đổi mật khẩu thành công!");
      return res.redirect("/member/profile");
    }

    return sendResponse(res, 200, true, "Đổi mật khẩu thành công");
  } catch (error) {
    if (req.headers.accept?.includes("text/html")) {
      req.flash("error", "Lỗi server! Vui lòng thử lại sau.");
      return res.redirect("/member/profile");
    }
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

module.exports = {
  getAllMembers,
  getMemberProfile,
  updateMemberProfile,
  changePassword,
  findAllMembers,
  deleteMember,
};
