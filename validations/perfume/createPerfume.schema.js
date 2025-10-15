const Joi = require("joi");

const createPerfumeSchema = Joi.object({
  perfumeName: Joi.string().min(2).max(100).required().messages({
    "string.base": "Tên nước hoa phải là chuỗi ký tự.",
    "string.empty": "Tên nước hoa không được để trống.",
    "string.min": "Tên nước hoa phải có ít nhất 2 ký tự.",
    "string.max": "Tên nước hoa không được vượt quá 100 ký tự.",
    "any.required": "Tên nước hoa là bắt buộc.",
  }),

  uri: Joi.string().trim().required().messages({
    "string.base": "URI phải là chuỗi.",
    "string.empty": "URI không được để trống.",
    "any.required": "URI là bắt buộc.",
  }),

  price: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là một số.",
    "number.min": "Giá không được âm.",
    "any.required": "Giá là bắt buộc.",
  }),

  concentration: Joi.string()
    .valid("EDT", "EDP", "Parfum", "Cologne")
    .required()
    .messages({
      "any.only":
        "Nồng độ (concentration) chỉ được là EDT, EDP, Parfum hoặc Cologne.",
      "any.required": "Nồng độ là bắt buộc.",
    }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Mô tả phải có ít nhất 10 ký tự.",
    "string.max": "Mô tả không được vượt quá 1000 ký tự.",
    "any.required": "Mô tả là bắt buộc.",
  }),

  ingredients: Joi.string().allow("").messages({
    "string.base": "Nguyên liệu phải là chuỗi ký tự.",
  }),

  volume: Joi.number().integer().min(5).max(500).required().messages({
    "number.base": "Dung tích phải là số.",
    "number.min": "Dung tích tối thiểu là 5ml.",
    "number.max": "Dung tích tối đa là 500ml.",
    "any.required": "Dung tích là bắt buộc.",
  }),

  targetAudience: Joi.string()
    .valid("Nam", "Nữ", "Unisex")
    .required()
    .messages({
      "any.only": "Đối tượng (targetAudience) chỉ được là Nam, Nữ hoặc Unisex.",
      "any.required": "Đối tượng là bắt buộc.",
    }),

  brand: Joi.string().required().messages({
    "string.base": "Brand ID phải là chuỗi.",
    "any.required": "Brand là bắt buộc.",
  }),
}).options({
  allowUnknown: true,
});

module.exports = createPerfumeSchema;
