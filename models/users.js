const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../service/schemas/users");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const Joi = require("joi");
const jimp = require("jimp");
const gravatar = require("gravatar");
require("dotenv").config();
const secret = process.env.SECRET;

const registerValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const createUser = async (req, res) => {
  const { error } = registerValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarURL = gravatar.url(email, { s: "250", d: "retro" });

    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

   
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

   
    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: "1h", 
    });

    res
      .status(200)
      .json({
        token,
        user: { email: user.email, subscription: user.subscription },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decodedToken = jwt.verify(token, secret);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

   
    user.token = '';
    await user.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    

    if (!user) {
      console.log("User not found!"); 
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
};

const storage = multer.diskStorage({
  destination: "tmp",
  filename: (req, file, cb) => {
    const ext = path.parse(file.originalname).ext;
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

const avatarUser = async (req, res, next) => {
  try {
    const tempFilePath = req.file.path;
    const image = await jimp.read(tempFilePath);
    await image.cover(250, 250).writeAsync(tempFilePath);

    const user = await User.findById(req.user._id);
    if (!user) {
      await fs.unlink(tempFilePath);
      return res.status(401).json({ message: "Not authorized" });
    }
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFileName = `${user._id.toString()}${fileExtension}`;
    const newAvatarPath = path.join("public", "avatars", uniqueFileName);
    await fs.rename(tempFilePath, newAvatarPath);
    user.avatarURL = `avatars/${uniqueFileName}`;
    await user.save();

    res.json({ avatarURL: user.avatarURL });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  loginUser,
  verifyToken,
  logoutUser,
  currentUser,
  avatarUser,
  upload
};
