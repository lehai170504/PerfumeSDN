const AuthSchema = {
  // Schema cho body khi đăng ký
  MemberRegister: {
    type: "object",
    properties: {
      email: { type: "string", example: "member@myteam.com" },
      password: { type: "string", example: "mysecretpassword" },
      name: { type: "string", example: "Nguyen Van A" },
      YOB: { type: "integer", example: 1995 },
      gender: { type: "boolean", example: true },
    },
    required: ["email", "password"],
  },
  // Schema cho body khi đăng nhập
  MemberLogin: {
    type: "object",
    properties: {
      email: { type: "string", example: "member@myteam.com" },
      password: { type: "string", example: "mysecretpassword" },
    },
    required: ["email", "password"],
  },
  // Schema cho Response khi đăng nhập thành công
  AuthResponse: {
    type: "object",
    properties: {
      _id: { type: "string" },
      email: { type: "string" },
      isAdmin: { type: "boolean" },
      token: { type: "string" },
    },
  },
};

module.exports = AuthSchema;
