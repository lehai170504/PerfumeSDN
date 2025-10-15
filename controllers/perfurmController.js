const Perfume = require("../models/Perfume");
const sendResponse = require("../middleware/responseHandler");

// ✅ [GET] /api/perfumes - Lấy danh sách tất cả perfume
const getPerfumes = async (req, res) => {
  try {
    const perfumes = await Perfume.find().populate("brand", "brandName");
    return sendResponse(res, 200, true, "Danh sách nước hoa", perfumes);
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

// ✅ [GET] /api/perfumes/:id - Lấy chi tiết 1 perfume
const getPerfumeById = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate("brand", "brandName")
      .populate("comments.user", "name email");

    if (!perfume) {
      return sendResponse(res, 404, false, "Không tìm thấy nước hoa");
    }

    return sendResponse(res, 200, true, "Chi tiết nước hoa", perfume);
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

// ✅ [POST] /api/perfumes - Tạo mới perfume (Admin)
const createPerfume = async (req, res) => {
  try {
    const {
      perfumeName,
      uri,
      price,
      concentration,
      description,
      ingredients,
      volume,
      targetAudience,
      brand,
    } = req.body;

    const existingPerfume = await Perfume.findOne({ uri });
    if (existingPerfume) {
      return sendResponse(res, 400, false, "URI đã tồn tại");
    }

    const newPerfume = new Perfume({
      perfumeName,
      uri,
      price,
      concentration,
      description,
      ingredients,
      volume,
      targetAudience,
      brand,
    });

    const savedPerfume = await newPerfume.save();
    return sendResponse(
      res,
      201,
      true,
      "Tạo nước hoa thành công",
      savedPerfume
    );
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

// ✅ [PUT] /api/perfumes/:id - Cập nhật perfume (Admin)
const updatePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return sendResponse(res, 404, false, "Không tìm thấy nước hoa");
    }

    const updatedPerfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return sendResponse(
      res,
      200,
      true,
      "Cập nhật nước hoa thành công",
      updatedPerfume
    );
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server", null, error.message);
  }
};

// ✅ [DELETE] /api/perfumes/:id - Xóa perfume (Admin)
const deletePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return sendResponse(res, 404, false, "Không tìm thấy nước hoa");
    }

    await perfume.deleteOne();
    return sendResponse(res, 200, true, "Đã xóa nước hoa thành công");
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
};
