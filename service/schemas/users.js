const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  avatarURL: String,
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String, 
    default: null,
    required: [true, "Verify token is required"],
  },
  token: String,
});

userSchema.pre("save", function (next) {
  if (this.isModified("verify") && this.verify === true) {
    this.verificationToken = null;
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
