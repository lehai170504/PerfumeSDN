const Member = require("../models/Member");
const generateToken = require("../utils/generateToken");
const sendResponse = require("../middleware/responseHandler");

const authMember = async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });

    if (member && (await member.matchPassword(password))) {
      // 1️⃣ TẠO TOKEN với ID và isAdmin
      const token = generateToken(member._id, member.isAdmin);

      // 2️⃣ THIẾT LẬP JWT COOKIE
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      // 3️⃣ PHÂN NHÁNH: EJS vs API (Swagger, Postman)
      if (
        req.headers.accept &&
        req.headers.accept.includes("application/json")
      ) {
        // Nếu là API → Trả về JSON (Swagger, Postman, client-side fetch)
        return sendResponse(res, 200, true, "Đăng nhập thành công", {
          user: {
            id: member._id,
            name: member.name,
            email: member.email,
            isAdmin: member.isAdmin,
          },
          token,
        });
      } else {
        // Nếu là form EJS → Chuyển hướng trực tiếp
        return res.redirect(member.isAdmin ? "/admin/dashboard" : "/");
      }
    } else {
      // Sai email hoặc mật khẩu
      return sendResponse(res, 401, false, "Email hoặc mật khẩu không hợp lệ");
    }
  } catch (error) {
    console.error(error);
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
  // Xóa cookie JWT
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  // Chuyển hướng về trang đăng nhập
  return res.redirect("/auth/login");
};

module.exports = { authMember, registerMember, logoutMember };
