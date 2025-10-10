// validations/auth/register.schema.js
const Joi = require("joi");

const registerSchema = Joi.object({
  // Name: Bắt buộc, chuỗi, tối thiểu 2 ký tự
  name: Joi.string().min(2).required().messages({
    "string.empty": `Tên không được để trống.`,
    "string.min": `Tên phải có ít nhất {#limit} ký tự.`,
    "any.required": `Tên là bắt buộc.`,
  }),

  // Email: Bắt buộc, định dạng email
  email: Joi.string().email().required().messages({
    "string.empty": `Email không được để trống.`,
    "string.email": `Email phải là định dạng hợp lệ.`,
    "any.required": `Email là bắt buộc.`,
  }),

  // Password: Bắt buộc, chuỗi, tối thiểu 6 ký tự
  password: Joi.string().min(6).required().messages({
    "string.empty": `Mật khẩu không được để trống.`,
    "string.min": `Mật khẩu phải có ít nhất {#limit} ký tự.`,
    "any.required": `Mật khẩu là bắt buộc.`,
  }),

  // AdminKey: chỉ cần khi tạo admin
  adminKey: Joi.string().optional(),
});

module.exports = registerSchema;
