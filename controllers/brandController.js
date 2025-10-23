// controllers/brandController.js
const Brand = require("../models/Brand");
const sendResponse = require("../middleware/responseHandler");
const Perfume = require("../models/Perfume");

exports.findAllBrands = async () => {
  try {
    return await Brand.find();
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách thương hiệu:", error);
    return [];
  }
};

exports.findBrandById = async (id) => {
  try {
    return await Brand.findById(id);
  } catch (error) {
    console.error("❌ Lỗi khi lấy thương hiệu theo ID:", error);
    return null;
  }
};

// GET ALL BRANDS
exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({});
    return sendResponse(res, 200, true, "Danh sách thương hiệu", brands);
  } catch (err) {
    next(err);
  }
};

// GET BRAND BY ID
exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.brandId);
    if (!brand)
      return sendResponse(res, 404, false, "Không tìm thấy thương hiệu");
    return sendResponse(res, 200, true, "Lấy thương hiệu thành công", brand);
  } catch (err) {
    next(err);
  }
};

// CREATE BRAND (API & WEB)
exports.createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body); // 💡 Logic cho Web Route (Redirect)

    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      req.flash("success", "Tạo thương hiệu mới thành công!");
      return res.redirect("/admin/manage_brands");
    } // ⚙️ Logic cho API (JSON Response)

    return sendResponse(res, 201, true, "Tạo thương hiệu thành công", brand);
  } catch (err) {
    let errorMessage = "Lỗi server không xác định. Vui lòng thử lại.";

    if (err.name === "ValidationError") {
      // Lấy thông báo lỗi đầu tiên của Mongoose Validation
      errorMessage = Object.values(err.errors)[0].message;
    } else if (err.code === 11000) {
      // Lỗi trùng lặp (Duplicate Key Error)
      errorMessage = "Tên thương hiệu đã tồn tại. Vui lòng chọn tên khác.";
    }

    if (err.name === "ValidationError" || err.code === 11000) {
      // 💡 Logic cho Web Route (Error Redirect)
      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        // 🎯 Cập nhật để gửi thông báo lỗi cụ thể
        req.flash("error", errorMessage);
        return res.redirect("/admin/manage_brands");
      } // ⚙️ Logic cho API (JSON Error)

      return sendResponse(
        res,
        400,
        false,
        "Dữ liệu không hợp lệ",
        null,
        err.message
      );
    }
    next(err);
  }
};

// UPDATE BRAND (API & WEB)
exports.updateBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!brand) {
      // 💡 Logic cho Web Route (Error Redirect)
      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        // 🎯 Sửa thông báo lỗi
        req.flash("error", "Không tìm thấy thương hiệu để cập nhật!");
        return res.redirect("/admin/manage_brands");
      }

      return sendResponse(
        res,
        404,
        false,
        "Không tìm thấy thương hiệu để cập nhật"
      );
    } // 💡 Logic cho Web Route (Redirect)

    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      req.flash("success", "Cập nhật thương hiệu thành công!");
      return res.redirect("/admin/manage_brands");
    } // ⚙️ Logic cho API (JSON Response)

    return sendResponse(
      res,
      200,
      true,
      "Cập nhật thương hiệu thành công",
      brand
    );
  } catch (err) {
    let errorMessage = "Cập nhật thương hiệu thất bại. Dữ liệu không hợp lệ.";

    if (err.name === "ValidationError") {
      errorMessage = Object.values(err.errors)[0].message;
    } else if (err.code === 11000) {
      errorMessage = "Tên thương hiệu đã tồn tại. Vui lòng chọn tên khác.";
    }

    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      // 🎯 Gửi thông báo lỗi cụ thể
      req.flash("error", errorMessage);
      return res.redirect("/admin/manage_brands");
    }

    next(err);
  }
};

// DELETE BRAND (API & WEB)
exports.deleteBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;

    const relatedDocumentsCount = await Perfume.countDocuments({
      brand: brandId,
    });

    if (relatedDocumentsCount > 0) {
      const errorMessage =
        "Không thể xóa/ẩn thương hiệu này vì có sản phẩm liên quan đang sử dụng nó.";

      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        req.flash("error", errorMessage);
        return res.redirect("/admin/manage_brands");
      }
      return sendResponse(res, 400, false, errorMessage);
    }

    const brand = await Brand.findByIdAndUpdate(
      brandId,
      { isDeleted: true },
      { new: true }
    );

    if (!brand) {
      const notFoundMessage = "Không tìm thấy thương hiệu để xóa/ẩn.";

      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        req.flash("error", notFoundMessage);
        return res.redirect("/admin/manage_brands");
      }
      return sendResponse(res, 404, false, notFoundMessage);
    }

    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      req.flash("success", "Ẩn/Xóa mềm thương hiệu thành công!");
      return res.redirect("/admin/manage_brands");
    }
    return sendResponse(
      res,
      200,
      true,
      `Đã ẩn/xóa mềm thương hiệu ${brand.brandName}`
    );
  } catch (err) {
    if (err.name === "CastError") {
      const castErrorMessage = "ID thương hiệu không hợp lệ.";

      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        req.flash("error", castErrorMessage);
        return res.redirect("/admin/manage_brands");
      }
      return sendResponse(res, 400, false, castErrorMessage);
    }

    next(err);
  }
};
