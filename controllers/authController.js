const Member = require("../models/Member");
const generateToken = require("../utils/generateToken");
const sendResponse = require("../middleware/responseHandler");

const authMember = async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });

    if (member && (await member.matchPassword(password))) {
      // 1. TẠO TOKEN với ID và isAdmin
      const token = generateToken(member._id, member.isAdmin);

      // 2. THIẾT LẬP JWT VÀO HTTP-ONLY COOKIE (Vẫn giữ lại)
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      // 3. THAY THẾ CHUYỂN HƯỚNG BẰNG VIỆC TRẢ VỀ PHẢN HỒI JSON
      // Đây là phần sửa lỗi chính: Trả về token và thông tin user.
      return sendResponse(res, 200, true, "Đăng nhập thành công", {
        user: {
          id: member._id,
          name: member.name,
          email: member.email,
          isAdmin: member.isAdmin,
          // Bổ sung các thông tin khác nếu cần
        },
        token: token, // Trả token về client (cho Swagger và các client không dùng cookie)
      });
    } else {
      // Đăng nhập thất bại: Trả về JSON lỗi (phù hợp với API)
      // Thay vì res.render("login", ...), dùng sendResponse cho API
      return sendResponse(res, 401, false, "Email hoặc mật khẩu không hợp lệ");
    }
  } catch (error) {
    console.error(error);
    // Trả về JSON lỗi server
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

const logoutMember = (req, res) => {
  // 1. XÓA COOKIE CHỨA JWT
  // Bằng cách thiết lập cookie 'jwt' với giá trị rỗng và đặt ngày hết hạn (expires) là ngay lập tức (hoặc trong quá khứ).
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Đặt ngày hết hạn là 0 (đã hết hạn)
  });

  // 2. CHUYỂN HƯỚNG VỀ TRANG ĐĂNG NHẬP
  return res.redirect("/auth/login");
};

module.exports = { authMember, registerMember, logoutMember };
