const express = require("express");
const router = express.Router();
const { createUser, loginUser, verifyToken, logoutUser, currentUser, avatarUser, upload, verifyEmailUser, sendVerifyEmailUser } = require("../../models/users");



router.post("/register", createUser);

router.post("/login", loginUser);

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "protected route" });
});

router.post("/logout", verifyToken, logoutUser);

router.get("/current", verifyToken, currentUser);

router.patch("/avatars", verifyToken, upload.single("avatar"), avatarUser);

router.get("/verify/:verificationToken", verifyEmailUser);

router.post("/verify" ,sendVerifyEmailUser)




module.exports = router;
