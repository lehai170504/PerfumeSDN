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

// CREATE BRAND (API)
exports.createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    return sendResponse(res, 201, true, "Tạo thương hiệu thành công", brand);
  } catch (err) {
    if (err.name === "ValidationError" || err.code === 11000) {
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

// UPDATE BRAND (API)
exports.updateBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!brand)
      return sendResponse(
        res,
        404,
        false,
        "Không tìm thấy thương hiệu để cập nhật"
      );

    return sendResponse(
      res,
      200,
      true,
      "Cập nhật thương hiệu thành công",
      brand
    );
  } catch (err) {
    if (err.name === "ValidationError" || err.code === 11000) {
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

// DELETE BRAND (API)
exports.deleteBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findByIdAndDelete(brandId);

    if (!brand)
      return sendResponse(res, 404, false, "Không tìm thấy thương hiệu để xóa");

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

/* ===================================================
 * 🧩 EJS ADMIN CONTROLLERS — có redirect + flash message
 * =================================================== */

// [POST] /admin/brands
exports.createBrandWeb = async (req, res, next) => {
  try {
    const { brandName } = req.body;
    if (!brandName || brandName.trim() === "") {
      req.session.message = {
        type: "error",
        text: "Tên thương hiệu không được để trống!",
      };
      return res.redirect("/admin/manage_brands");
    }

    await Brand.create({ brandName });
    console.log("✅ Tạo thương hiệu:", brandName);

    req.session.message = {
      type: "success",
      text: "Tạo thương hiệu mới thành công!",
    };
    return res.redirect("/admin/manage_brands");
  } catch (error) {
    console.error("❌ Lỗi khi tạo thương hiệu:", error);
    req.session.message = {
      type: "error",
      text: "Đã xảy ra lỗi khi tạo thương hiệu.",
    };
    next(error);
  }
};

// [PUT] /admin/brands/:id
exports.updateBrandWeb = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brandName } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      req.session.message = {
        type: "error",
        text: "Không tìm thấy thương hiệu để cập nhật!",
      };
      return res.redirect("/admin/manage_brands");
    }

    brand.brandName = brandName;
    await brand.save();

    console.log("✅ Cập nhật thương hiệu:", brandName);
    req.session.message = {
      type: "success",
      text: "Cập nhật thương hiệu thành công!",
    };
    return res.redirect("/admin/manage_brands");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật thương hiệu:", error);
    req.session.message = {
      type: "error",
      text: "Lỗi trong quá trình cập nhật thương hiệu.",
    };
    next(error);
  }
};

// [DELETE] /admin/brands/:id
exports.deleteBrandWeb = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Brand.findByIdAndDelete(id);

    console.log("🗑️ Đã xóa thương hiệu:", id);
    req.session.message = {
      type: "success",
      text: "Xóa thương hiệu thành công!",
    };
    return res.redirect("/admin/manage_brands");
  } catch (error) {
    console.error("❌ Lỗi khi xóa thương hiệu:", error);
    req.session.message = { type: "error", text: "Không thể xóa thương hiệu." };
    next(error);
  }
};
