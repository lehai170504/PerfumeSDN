const Joi = require("joi");

const commentSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(3).required().messages({
    "number.base": `Đánh giá (Rating) phải là một số.`,
    "number.integer": `Đánh giá (Rating) phải là số nguyên.`,
    "number.min": `Đánh giá (Rating) tối thiểu phải là 1.`,
    "number.max": `Đánh giá (Rating) tối đa phải là 3.`,
    "any.required": `Đánh giá (Rating) là bắt buộc.`,
  }),

  content: Joi.string().min(1).required().messages({
    "string.empty": `Nội dung bình luận (Content) không được để trống.`,
    "any.required": `Nội dung bình luận (Content) là bắt buộc.`,
  }),
}).options({
  allowUnknown: true,
});

module.exports = commentSchema;
