import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, //prevent XSS attacks cross-site scripting attacks
    maxAge: 1000 * 60 * 60 * 24 * 15,
    sameSite: "strict", // prevent CSRF attacks cross-site request forgery
    secure: process.env.NODE_ENV !== "development",
  });
};
