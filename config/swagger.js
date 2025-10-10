const swaggerJsdoc = require("swagger-jsdoc");
const AuthSchema = require("./schema");

const options = {
  // Định nghĩa thông tin cơ bản về API của bạn
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Perfume MERN Stack API",
      version: "1.0.0",
      description:
        "API documentation for the MERN Stack Assignment (Perfume Shop)",
    },
    servers: [
      {
        url: "http://localhost:5000/api", // Đảm bảo URL này khớp với cổng của bạn
      },
    ],
    // TÍCH HỢP SCHEMAS VÀ SECURITY
    components: {
      schemas: AuthSchema, // BẮT BUỘC: Tích hợp schemas vào đây
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter the JWT token obtained after login (e.g., Bearer tokenValue)",
        },
      },
    },
  },
  // Khai báo các file chứa code JSDoc/Swagger để tự động tạo tài liệu
  apis: ["./routes/*.js", "./models/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
