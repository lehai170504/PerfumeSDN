const Member = require("../models/Member");
const sendResponse = require("../middleware/responseHandler");
const bcrypt = require("bcrypt");

// [Admin] Lấy tất cả members (collectors)
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().select("-password"); // không trả password
    return sendResponse(res, 200, true, "Danh sách thành viên", members);
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
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

// [Member] Cập nhật profile (không đổi password ở đây)
const updateMemberProfile = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id);

    if (!member) {
      return sendResponse(res, 404, false, "Không tìm thấy thành viên");
    }

    member.name = req.body.name || member.name;
    member.email = req.body.email || member.email;
    member.YOB = req.body.YOB || member.YOB;
    member.gender =
      req.body.gender !== undefined ? req.body.gender : member.gender;

    const updatedMember = await member.save();

    return sendResponse(res, 200, true, "Cập nhật profile thành công", {
      id: updatedMember._id,
      name: updatedMember.name,
      email: updatedMember.email,
      YOB: updatedMember.YOB,
      gender: updatedMember.gender,
      isAdmin: updatedMember.isAdmin,
    });
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

// [Member] Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const member = await Member.findById(req.member._id);

    if (!member) {
      return sendResponse(res, 404, false, "Không tìm thấy thành viên");
    }

    const isMatch = await member.matchPassword(currentPassword);
    if (!isMatch) {
      return sendResponse(res, 400, false, "Mật khẩu hiện tại không đúng");
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    member.password = await bcrypt.hash(newPassword, salt);

    await member.save();

    return sendResponse(res, 200, true, "Đổi mật khẩu thành công");
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

module.exports = {
  getAllMembers,
  getMemberProfile,
  updateMemberProfile,
  changePassword,
};
