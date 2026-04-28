import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decodedUser = jwt.verify(token, JWT_SECRET) as {
    id: string;
    username: string;
    role: string;
  };

  req.user = decodedUser;
  next();
};

const privateApis = [
  { path: "/books", method: "GET" },
  { path: "/book/:id", method: "GET" },
  { path: "/categories", method: "GET" },
  { path: "/category/:id", method: "GET" },
];
