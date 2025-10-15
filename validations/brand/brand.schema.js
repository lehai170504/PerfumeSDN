// validations/brand.schema.js
const Joi = require("joi");

const brandSchema = Joi.object({
  brandName: Joi.string().required().min(2).max(100).messages({
    "string.empty": `Tên thương hiệu không được để trống.`,
    "string.min": `Tên thương hiệu phải có ít nhất {#limit} ký tự.`,
    "string.max": `Tên thương hiệu không được vượt quá {#limit} ký tự.`,
    "any.required": `Tên thương hiệu là bắt buộc.`,
  }),
});

// Schema cho việc tạo Brand mới (POST) - Tất cả đều required
exports.createBrandSchema = brandSchema;

// Schema cho việc cập nhật Brand (PUT) - Không cần required,
// sử dụng .custom((value, helpers) => {}) để đảm bảo ít nhất 1 trường được gửi lên
exports.updateBrandSchema = Joi.object({
  brandName: Joi.string().min(2).max(100).messages({
    "string.empty": `Tên thương hiệu không được để trống.`,
    "string.min": `Tên thương hiệu phải có ít nhất {#limit} ký tự.`,
    "string.max": `Tên thương hiệu không được vượt quá {#limit} ký tự.`,
  }),
})
  .min(1) // Đảm bảo ít nhất một trường trong object phải được gửi lên
  .messages({
    "object.min":
      "Cần cung cấp ít nhất một trường để cập nhật (ví dụ: 'name').",
  });
