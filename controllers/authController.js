const Member = require("../models/Member");
const generateToken = require("../utils/generateToken");

const authMember = async (req, res) => {
  const { email, password } = req.body;

  const member = await Member.findOne({ email });

  if (member && (await member.matchPassword(password))) {
    res.json({
      _id: member._id,
      name: member.name,
      email: member.email,
      isAdmin: member.isAdmin,
      token: generateToken(member._id), // Trả về token khi đăng nhập thành công
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" }); // Unauthorized
  }
};

const registerMember = async (req, res) => {
  const { name, email, password, YOB, gender } = req.body;
  const memberExists = await Member.findOne({ email });
  if (memberExists) {
    return res.status(400).json({ message: "Member already exists" }); // Bad Request
  }
  const member = await Member.create({
    email,
    password,
    name,
    YOB,
    gender,
  });

  if (member) {
    res.status(201).json({
      _id: member._id,
      name: member.name,
      email: member.email,
      isAdmin: member.isAdmin,
      token: generateToken(member._id), // Trả về token khi đăng ký thành công
    });
  } else {
    res.status(400).json({ message: "Invalid member data" }); // Bad Request
  }
};

module.exports = { authMember, registerMember };
