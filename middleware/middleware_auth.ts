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
  const isPrivateAPI = privateApis.some(
    ({ path, method }) => path === req.path && method === req.method,
  );

  if (!isPrivateAPI) {
    return next();
  }

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodedUser = jwt.decode(token) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = decodedUser;
    next();
  });
};

const privateApis = [
  { path: "/books", method: "GET" },
  { path: "/book/:id", method: "GET" },
  { path: "/categories", method: "GET" },
  { path: "/category/:id", method: "GET" },
  { path: "/profile", method: "GET" },
];
