// middleware/validate.js (Sửa lại)

const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    // 1. Chạy xác thực schema
    // Bổ sung tham số property để hỗ trợ validate req.params hoặc req.query nếu cần
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    }); // 2. Kiểm tra nếu có lỗi

    // ... (Phần logic xử lý lỗi giữ nguyên)

    if (error) {
      // 3. Xử lý và định dạng lỗi chi tiết
      const errors = error.details.map((detail) => {
        return {
          message: detail.message.replace(/['"]+/g, ""),
          field: detail.path[0],
          type: detail.type,
        };
      }); // 4. Trả về phản hồi 400 Bad Request với mảng lỗi chi tiết

      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường.",
        errors: errors, // Mảng lỗi chi tiết
      });
    } // 5. Nếu không có lỗi, chuyển sang Controller

    next();
  };

module.exports = validate;
