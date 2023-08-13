const nodemailer = require("nodemailer");
require("dotenv").config();

const user = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user,
    pass,
  },
});

module.exports = {
    transporter
}
