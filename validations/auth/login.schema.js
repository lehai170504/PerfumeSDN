// validations/auth/login.schema.js
const Joi = require("joi");

const loginSchema = Joi.object({
  // Email: Bắt buộc, phải là định dạng email hợp lệ
  email: Joi.string().email().required().messages({
    "string.empty": `Email không được để trống.`,
    "string.email": `Email phải là định dạng hợp lệ.`,
    "any.required": `Email là bắt buộc.`,
  }),

  // Password: Bắt buộc
  password: Joi.string().required().messages({
    "string.empty": `Mật khẩu không được để trống.`,
    "any.required": `Mật khẩu là bắt buộc.`,
  }),
});

module.exports = loginSchema;
