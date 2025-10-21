const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    });

    const isApiRequest = req.headers.accept?.includes("application/json");

    if (error) {
      const firstErrorMessage = error.details[0].message.replace(/['"]+/g, "");

      if (!isApiRequest) {
        req.flash("error", firstErrorMessage);

        return res.redirect(
          req.originalUrl.includes("/admin") ? "/admin/manage_perfumes" : "back"
        );
      }

      const errors = error.details.map((detail) => {
        return {
          message: detail.message.replace(/['"]+/g, ""),
          field: detail.path[0],
          type: detail.type,
        };
      });

      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường.",
        errors: errors,
      });
    }

    // Nếu không có lỗi, chuyển sang Controller
    next();
  };

module.exports = validate;
