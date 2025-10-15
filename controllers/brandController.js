// controllers/brandController.js

const Brand = require("../models/Brand");
const sendResponse = require("../middleware/responseHandler");

// 1. GET ALL BRANDS (Public Route)
exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({});
    // Success: 200 OK
    return sendResponse(res, 200, true, "Brands fetched successfully", brands);
  } catch (err) {
    // Pass the error to the Express error handler (or handle it with sendResponse if necessary)
    next(err);
  }
};

// 2. GET BRAND BY ID (Public Route)
exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.brandId);
    if (brand) {
      // Success: 200 OK
      return sendResponse(res, 200, true, "Brand fetched successfully", brand);
    } else {
      // Not Found: 404
      return sendResponse(res, 404, false, "Brand not found");
    }
  } catch (err) {
    // For invalid ID format (CastError), next(err) will typically catch it,
    // but for immediate response, you might add a check here.
    next(err);
  }
};

// 3. CREATE BRAND (Admin Only)
exports.createBrand = async (req, res, next) => {
  try {
    // Validate request body content here if needed
    const brand = await Brand.create(req.body);
    // Created: 201
    return sendResponse(res, 201, true, "Brand created successfully", brand);
  } catch (err) {
    // Handle validation or duplicate key errors from Mongoose
    if (err.brandName === "ValidationError" || err.code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        "Failed to create brand due to invalid data or duplicate name",
        null,
        err.message
      );
    }
    next(err); // Pass other errors to the global error handler
  }
};

// 4. UPDATE BRAND (Admin Only)
exports.updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.brandId,
      { $set: req.body },
      { new: true, runValidators: true } // { new: true } returns the updated document
    );

    if (brand) {
      // Success: 200 OK
      return sendResponse(res, 200, true, "Brand updated successfully", brand);
    } else {
      // Not Found: 404
      return sendResponse(res, 404, false, "Brand not found for update");
    }
  } catch (err) {
    // Handle validation or Mongoose errors
    if (err.brandName === "ValidationError" || err.code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        "Failed to update brand due to invalid data or duplicate name",
        null,
        err.message
      );
    }
    next(err);
  }
};

// 5. DELETE BRAND (Admin Only)
exports.deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.brandId);

    if (brand) {
      // Success: 200 OK
      return sendResponse(
        res,
        200,
        true,
        `Brand ${brand.brandName} deleted successfully`
      );
    } else {
      // Not Found: 404
      return sendResponse(res, 404, false, "Brand not found for deletion");
    }
  } catch (err) {
    next(err);
  }
};
