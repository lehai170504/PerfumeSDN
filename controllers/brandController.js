// controllers/brandController.js
const Brand = require("../models/Brand");
const sendResponse = require("../middleware/responseHandler");

/* ===================================================
 * 🧠 SHARED LOGIC — dùng được cho EJS & API
 * =================================================== */
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

/* ===================================================
 * ⚙️ API CONTROLLERS — dùng cho Swagger / API routes
 * =================================================== */

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
    const brand = await Brand.create(req.body);

    // 💡 Logic cho Web Route (Redirect)
    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      req.session.message = {
        type: "success",
        text: "Tạo thương hiệu mới thành công!",
      };
      return res.redirect("/admin/manage_brands");
    }

    // ⚙️ Logic cho API (JSON Response)
    return sendResponse(res, 201, true, "Tạo thương hiệu thành công", brand);
  } catch (err) {
    if (err.name === "ValidationError" || err.code === 11000) {
      // 💡 Logic cho Web Route (Error Redirect)
      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        req.session.message = {
          type: "error",
          text: "Dữ liệu không hợp lệ hoặc Tên thương hiệu đã tồn tại.",
        };
        return res.redirect("/admin/manage_brands");
      }

      // ⚙️ Logic cho API (JSON Error)
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
        req.session.message = {
          type: "error",
          text: "Không tìm thấy thương hiệu để cập nhật!",
        };
        return res.redirect("/admin/manage_brands");
      }

      // ⚙️ Logic cho API (JSON Error)
      return sendResponse(
        res,
        404,
        false,
        "Không tìm thấy thương hiệu để cập nhật"
      );
    }

    // 💡 Logic cho Web Route (Redirect)
    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      req.session.message = {
        type: "success",
        text: "Cập nhật thương hiệu thành công!",
      };
      return res.redirect("/admin/manage_brands");
    }

    // ⚙️ Logic cho API (JSON Response)
    return sendResponse(
      res,
      200,
      true,
      "Cập nhật thương hiệu thành công",
      brand
    );
  } catch (err) {
    next(err);
  }
};

// DELETE BRAND (API & WEB)
exports.deleteBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findByIdAndDelete(brandId);

    if (!brand) {
      if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
        req.session.message = {
          type: "error",
          text: "Không tìm thấy thương hiệu để xóa.",
        };
        return res.redirect("/admin/manage_brands");
      }
      return sendResponse(res, 404, false, "Không tìm thấy thương hiệu để xóa");
    }

    if (req.originalUrl.includes("/admin/brands") && !req.headersSent) {
      req.session.message = {
        type: "success",
        text: "Xóa thương hiệu thành công!",
      };
      return res.redirect("/admin/manage_brands");
    }
    return sendResponse(
      res,
      200,
      true,
      `Đã xóa thương hiệu ${brand.brandName}`
    );
  } catch (err) {
    next(err);
  }
};
