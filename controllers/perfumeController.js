const Perfume = require("../models/Perfume");
const Brand = require("../models/Brand");
const sendResponse = require("../middleware/responseHandler");

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
    return perfumes;
  } catch (error) {
    if (res) {
      return sendResponse(res, 500, false, "Lỗi server", null, error.message);
    }
    throw error;
  }
};

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
  if (!perfumeId) return null;

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

    const existingPerfume = await Perfume.findOne({ perfumeName: perfumeName });
    if (existingPerfume) {
      req.flash(
        "error",
        "Tên nước hoa này đã tồn tại. Vui lòng chọn tên khác."
      );
      return res.redirect("/admin/manage_perfumes");
    }

    if (!imagePath) {
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

    req.flash("success", "Tạo nước hoa mới thành công!");

    return res.redirect("/admin/manage_perfumes");
  } catch (error) {
    let errorMessage = "Đã xảy ra lỗi khi tạo nước hoa.";

    if (error.name === "ValidationError") {
      errorMessage = Object.values(error.errors)[0].message;
    } else if (error.code === 11000) {
      errorMessage = "Tên nước hoa đã tồn tại. Vui lòng chọn tên khác.";
    }

    req.flash("error", errorMessage);
    return res.redirect("/admin/manage_perfumes");
  }
};

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
      req.flash("error", "Không tìm thấy nước hoa để cập nhật!");
      return res.redirect("/admin/manage_perfumes");
    }

    if (perfumeName && perfumeName !== perfume.perfumeName) {
      const existingPerfume = await Perfume.findOne({
        perfumeName: perfumeName,
      });

      if (existingPerfume && existingPerfume._id.toString() !== id) {
        req.flash(
          "error",
          "Tên nước hoa này đã tồn tại. Vui lòng chọn tên khác."
        );
        return res.redirect("/admin/manage_perfumes");
      }
    }

    const newImagePath = req.file
      ? `/uploads/${req.file.filename}`
      : perfume.uri;

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

    req.flash("success", "Cập nhật nước hoa thành công!");

    return res.redirect("/admin/manage_perfumes");
  } catch (error) {
    let errorMessage = "Đã xảy ra lỗi khi cập nhật nước hoa.";

    if (error.name === "ValidationError") {
      errorMessage = Object.values(error.errors)[0].message;
    } else if (error.code === 11000) {
      errorMessage = "Tên nước hoa đã tồn tại. Vui lòng chọn tên khác.";
    }

    req.flash("error", errorMessage);
    return res.redirect("/admin/manage_perfumes");
  }
};

const deletePerfume = async (req, res) => {
  try {
    const deletedPerfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedPerfume) {
      req.flash("error", "Không tìm thấy nước hoa để ẩn/xóa mềm.");
      return res.redirect("/admin/manage_perfumes");
    }

    req.flash("success", "Ẩn/Xóa mềm nước hoa thành công.");
    return res.redirect("/admin/manage_perfumes");
  } catch (error) {
    req.flash("error", "Đã xảy ra lỗi khi ẩn/xóa mềm nước hoa.");
    console.error("Error during soft delete:", error);
    return res.redirect("/admin/manage_perfumes");
  }
};

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
