const Member = require("../models/Member");
const generateToken = require("../utils/generateToken");
const sendResponse = require("../middleware/responseHandler");

const authMember = async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });

    if (member && (await member.matchPassword(password))) {
      return sendResponse(res, 200, true, "Đăng nhập thành công", {
        user: {
          id: member._id,
          name: member.name,
          email: member.email,
          isAdmin: member.isAdmin,
        },
        token: generateToken(member._id),
      });
    } else {
      return sendResponse(res, 401, false, "Email hoặc mật khẩu không hợp lệ");
    }
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

const registerMember = async (req, res) => {
  const { name, email, password, YOB, gender, adminKey } = req.body;

  try {
    const memberExists = await Member.findOne({ email });
    if (memberExists) {
      return sendResponse(res, 400, false, "Thành viên đã tồn tại");
    }

    // Mặc định user thường
    let isAdmin = false;

    // Nếu có adminKey đúng -> cho phép tạo admin
    if (adminKey && adminKey === process.env.ADMIN_KEY) {
      isAdmin = true;
    }

    const member = await Member.create({
      email,
      password,
      name,
      YOB,
      gender,
      isAdmin,
    });

    if (member) {
      return sendResponse(res, 201, true, "Đăng ký thành công", {
        user: {
          id: member._id,
          name: member.name,
          email: member.email,
          YOB: member.YOB,
          gender: member.gender,
          isAdmin: member.isAdmin,
        },
        token: generateToken(member._id),
      });
    } else {
      return sendResponse(res, 400, false, "Dữ liệu thành viên không hợp lệ");
    }
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

module.exports = { authMember, registerMember };
