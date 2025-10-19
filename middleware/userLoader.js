const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const checkUser = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await Member.findById(decoded.id)
        .select("name isAdmin")
        .lean();
      req.member = user;
    } catch (err) {
      res.clearCookie("jwt");
      req.member = null;
    }
  } else {
    req.member = null;
  }
  next();
};

module.exports = checkUser;
