import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9. _%+-]+@[a-zA-Z0-9. -]+\. [a-zA-Z]{2,}$/;
    if (emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid Email format",
      });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        error: "email already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName: fullName,
      username: username,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Failed to create user" });
    }
  } catch (e) {
    console.log("Error in signup controller");
    res.status(500).json({ message: "Unable to signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isValidPassword = await bcrypt.compare(password, user.password || "");
    if (!user || !isValidPassword) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (e) {
    console.log("Error in login controller");
    res.status(500).json({ message: e.message });
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    console.log("Error in logout controller");
    res.status(500).json({ message: e.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (e) {
    console.log("Error in getMe controller");
    res.status(500).json({ message: e.message });
  }
};
