const Joi = require("joi");

const editPerfumeSchema = Joi.object({
  perfumeName: Joi.string().min(2).max(100).messages({
    "string.base": "Tên nước hoa phải là chuỗi ký tự.",
    "string.empty": "Tên nước hoa không được để trống.",
    "string.min": "Tên nước hoa phải có ít nhất 2 ký tự.",
    "string.max": "Tên nước hoa không được vượt quá 100 ký tự.",
  }),

  uri: Joi.string().trim().messages({
    "string.base": "URI phải là chuỗi.",
    "string.empty": "URI không được để trống.",
  }),

  price: Joi.number().min(0).messages({
    "number.base": "Giá phải là một số.",
    "number.min": "Giá không được âm.",
  }),

  concentration: Joi.string()
    .valid("EDT", "EDP", "Parfum", "Cologne")
    .messages({
      "any.only":
        "Nồng độ (concentration) chỉ được là EDT, EDP, Parfum hoặc Cologne.",
    }),

  description: Joi.string().min(10).max(1000).messages({
    "string.min": "Mô tả phải có ít nhất 10 ký tự.",
    "string.max": "Mô tả không được vượt quá 1000 ký tự.",
  }),

  ingredients: Joi.string().allow("").messages({
    "string.base": "Nguyên liệu phải là chuỗi ký tự.",
  }),

  volume: Joi.number().integer().min(5).max(500).messages({
    "number.base": "Dung tích phải là số.",
    "number.min": "Dung tích tối thiểu là 5ml.",
    "number.max": "Dung tích tối đa là 500ml.",
  }),

  targetAudience: Joi.string().valid("Nam", "Nữ", "Unisex").messages({
    "any.only": "Đối tượng (targetAudience) chỉ được là Nam, Nữ hoặc Unisex.",
  }),

  brand: Joi.string().messages({
    "string.base": "Brand ID phải là chuỗi.",
  }),
}).options({
  allowUnknown: true,
});

module.exports = editPerfumeSchema;
