const Perfume = require("../models/Perfume");
const Brand = require("../models/Brand");
const sendResponse = require("../middleware/responseHandler");

// ✅ [GET] /api/perfumes (HỖ TRỢ TÌM KIẾM VÀ LỌC)
const getPerfumes = async (req, res) => {
  try {
    const { search, brandId } = req.query;
    const query = {};

    if (brandId) {
      query.brand = brandId;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [{ perfumeName: searchRegex }, { description: searchRegex }];
    }

    const perfumes = await Perfume.find(query).populate("brand", "brandName");

    if (res) {
      return sendResponse(res, 200, true, "Danh sách nước hoa", perfumes);
    }
    // Dành cho Web Route Controller
    return perfumes;
  } catch (error) {
    if (res) {
      return sendResponse(res, 500, false, "Lỗi server", null, error.message);
    }
    throw error; // cho web route bắt lỗi qua next(error)
  }
};
// ✅ [GET] /api/perfumes/:id - Lấy chi tiết 1 perfume
const getPerfumeById = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate("brand", "brandName")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "Members",
          select: "name",
        },
      });

    if (!perfume) {
      return sendResponse(res, 404, false, "Không tìm thấy nước hoa");
    }

    return sendResponse(res, 200, true, "Chi tiết nước hoa", perfume);
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

const findPerfume = async (perfumeId) => {
  // Kiểm tra tính hợp lệ của ID
  if (!perfumeId) return null;

  // Logic truy vấn phức tạp (populate)
  return await Perfume.findById(perfumeId)
    .populate("brand", "brandName")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "Members",
        select: "name",
      },
    });
};

// 🧠 [POST] /admin/perfumes — Tạo mới perfume (upload ảnh)
const createPerfume = async (req, res, next) => {
  try {
    const {
      perfumeName,
      brandId,
      price,
      volume,
      targetAudience,
      concentration,
      description,
      ingredients,
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imagePath) {
      console.warn("⚠️ Không có ảnh tải lên!");
      req.flash("error", "Vui lòng tải lên hình ảnh sản phẩm!");
      return res.redirect("/admin/manage_perfumes");
    }

    await Perfume.create({
      perfumeName,
      brand: brandId,
      price,
      volume,
      targetAudience,
      concentration,
      description,
      ingredients,
      uri: imagePath,
    });

    console.log("✅ Tạo perfume thành công:", perfumeName);
    req.flash("success", "Tạo nước hoa mới thành công!");

    return res.redirect("/admin/manage_perfumes");
  } catch (error) {
    console.error("❌ Lỗi khi tạo perfume:", error);
    req.flash("error", "Đã xảy ra lỗi khi tạo nước hoa.");
    next(error);
  }
};

// 🧠 [PUT] /admin/perfumes/:id — Cập nhật perfume (có thể upload ảnh mới)
const updatePerfume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      perfumeName,
      brandId,
      price,
      volume,
      targetAudience,
      concentration,
      description,
      ingredients,
    } = req.body;

    const perfume = await Perfume.findById(id);
    if (!perfume) {
      console.warn("⚠️ Không tìm thấy perfume ID:", id);
      // SỬ DỤNG req.flash
      req.flash("error", "Không tìm thấy nước hoa để cập nhật!");
      return res.redirect("/admin/manage_perfumes");
    } // 🖼️ Nếu có file upload thì thay ảnh, ngược lại giữ ảnh cũ

    const newImagePath = req.file
      ? `/uploads/${req.file.filename}`
      : perfume.uri; // 🧩 Cập nhật dữ liệu

    perfume.perfumeName = perfumeName;
    perfume.brand = brandId;
    perfume.price = price;
    perfume.volume = volume;
    perfume.targetAudience = targetAudience;
    perfume.concentration = concentration;
    perfume.description = description;
    perfume.ingredients = ingredients;
    perfume.uri = newImagePath;

    await perfume.save();

    console.log("✅ Cập nhật perfume thành công:", perfumeName);
    req.flash("success", "Cập nhật nước hoa thành công!");

    return res.redirect("/admin/manage_perfumes");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật perfume:", error);
    req.flash("error", "Đã xảy ra lỗi khi cập nhật nước hoa.");
    next(error);
  }
};

// 🧠 Xóa perfume
const deletePerfume = async (req, res) => {
  try {
    const deletedPerfume = await Perfume.findByIdAndDelete(req.params.id);

    if (!deletedPerfume) {
      req.flash("error", "Không tìm thấy nước hoa để xóa.");
      return res.redirect("/admin/manage_perfumes");
    }

    req.flash("success", "Xóa nước hoa thành công.");
    return res.redirect("/admin/manage_perfumes");
  } catch (error) {
    console.error("❌ Lỗi khi xóa perfume:", error);
    req.flash("error", "Đã xảy ra lỗi khi xóa nước hoa.");
    return res.redirect("/admin/manage_perfumes");
  }
};

// [Public] Tìm kiếm perfumes theo tên nước hoa, mô tả hoặc brand
const searchPerfumes = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return sendResponse(res, 400, false, "Vui lòng nhập từ khóa tìm kiếm");
    }

    const brands = await require("../models/Brand")
      .find({
        brandName: { $regex: keyword, $options: "i" },
      })
      .select("_id");
    const brandIds = brands.map((brand) => brand._id);

    const searchCondition = {
      $or: [
        { perfumeName: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { brand: { $in: brandIds } },
      ],
    };

    const perfumes = await Perfume.find(searchCondition).populate(
      "brand",
      "brandName"
    );

    return sendResponse(
      res,
      200,
      true,
      `Kết quả tìm kiếm cho "${keyword}"`,
      perfumes
    );
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

module.exports = {
  getPerfumes,
  getPerfumeById,
  createPerfume,
  updatePerfume,
  deletePerfume,
  searchPerfumes,
  findPerfume,
};
