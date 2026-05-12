import express from "express";
import type {
  apiResponse,
  book,
  bookResponse,
  category,
  categoryResponse,
  loginPayload,
  loginResponse,
  logoutResponse,
  registerPayload,
  registerResponse,
  userResponse,
} from "../types/type";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma, User } from "../lib/prisma";
import cookieParser from "cookie-parser";
import { authMiddleware } from "../middleware/middleware_auth";
import cors from "cors";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// register routes
app.post<string, null, apiResponse<string | null>, registerPayload>(
  "/auth/register",
  async (req, res) => {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: req.body.email }, { username: req.body.username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          data: null,
          status: "existing email and password",
        });
      }

      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const userRegister = await prisma.user.create({
        data: { ...req.body, password: hashedPassword },
      });

      console.log("User registration successful", userRegister);

      const total = await prisma.user.count({
        where: { deletedAt: null },
      });

      res.status(200).json({ data: null, status: "success", total });
    } catch (error) {
      throw error;
    }
  },
);

// login routes
app.post<string, null, apiResponse<string | null>, loginPayload>(
  "/auth/login",
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(404).json({
          data: null,
          status: "account is not registered",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          data: null,
          status: "password is incorrect",
        });
      }

      //payload for JWT token
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      // Generate JWT token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
        sameSite: "lax",
      });

      res.status(200).json({
        data: null,
        status: "login successfull",
      });
    } catch (err) {
      console.error("Error logging in:", err);
    }
  },
);

//endpoint logout
app.post<string, null, apiResponse<null>, logoutResponse>(
  "/auth/logout",
  (_, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
        sameSite: "lax",
      });
      res.status(200).json({
        data:  null, 
        status: "logout successfull"
      })
    } catch (error) {
      res.status(500).json({
        data: null,
        status: "error",
      });
    }
  },
);

//endpoint auth in react
app.get<string, null, apiResponse<string | null>, userResponse>(
  "/profile",
  async (req, res: express.Response) => {
    try {
      const userId = req.user?.id;

      const dataUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dataUser) {
        return res.status(404).json({
          data: null,
          status: "user not found",
        });
      }

      const { password, ...loggedinUser }: User = dataUser;

      res.status(200).json({
        data: loggedinUser,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        data: null,
        status: "error",
      });
      console.error("Error fetching user profile:", error);
    }
  },
);

// books Response
app.get<string, null, apiResponse<book[]>>("/books", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const booksData = await prisma.book.findMany({
      where: { deletedAt: null },
      skip,
      take: limit,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const total = await prisma.book.count({
      where: { deletedAt: null },
    });
    console.log(`Total books: ${total}`);

    res.status(200).json({
      data: booksData,
      status: "success",
      total,
      pagination: {
        page,
        limit,
      },
    });
  } catch (err) {
    console.error(err);
  }
});

app.get<string, { id: string }, apiResponse<book | null>>(
  "/book/:id",
  async (req, res) => {
    const booksById = await prisma.book.findFirstOrThrow({
      where: { id: req.params.id, deletedAt: null },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      data: booksById,
      status: "success",
      total: 1,
    });
  },
);

app.post<string, null, apiResponse<null>, bookResponse>(
  "/book/create",
  async (req, res) => {
    try {
      const bookCreate = await prisma.book.create({
        data: req.body,
      });

      const total = await prisma.book.count({
        where: { deletedAt: null },
      });

      res.status(200).json({
        data: null,
        status: "success",
        total,
      });
      console.log("create is completed", bookCreate);
    } catch (err) {
      console.error(err);
    }
  },
);

app.delete<string, { id: string }, apiResponse<null>>(
  "/book/:id",
  async (req, res) => {
    try {
      const bookDelete = await prisma.book.update({
        where: { id: req.params.id },
        data: {
          deletedAt: new Date(),
        },
      });
      res.status(200).json({
        data: null,
        status: "success",
        total: 1,
      });
      console.log(
        `id:${bookDelete.id} BookName:${bookDelete.name} is softDeleted`,
      );
    } catch (err) {
      console.error(err);
    }
  },
);

app.put<string, { id: string }, apiResponse<null>>(
  "/book/:id",
  async (req, res) => {
    try {
      const bookUpdate = await prisma.book.update({
        where: { id: req.params.id },
        data: req.body,
      });
      console.log(
        `update Successfull  id: ${bookUpdate.id}  book: ${bookUpdate.name}`,
      );
      res.status(200).json({ data: null, status: "success", total: 1 });
    } catch (err) {
      console.error(err);
    }
  },
);

// Categories Response
app.get<string, null, apiResponse<category[]>>(
  "/categories",
  async (_, res) => {
    try {
      const categories = await prisma.category.findMany({
        where: { deletedAt: null },
      });

      const total = categories.length.valueOf();
      console.log(`Total categories: ${total}`);

      res.status(200).json({
        data: categories,
        status: "success",
        total,
      });
    } catch (err) {
      console.error(err);
    }
  },
);

app.get<string, { id: string }, apiResponse<category | null>>(
  "/category/:id",
  async (req, res) => {
    const categoryById = await prisma.category.findFirstOrThrow({
      where: { id: req.params.id, deletedAt: null },
    });
    res.status(200).json({
      data: categoryById,
      status: "success",
      total: 1,
    });
  },
);

app.post<string, null, apiResponse<null>, categoryResponse>(
  "/category/create",
  async (req, res) => {
    try {
      const categoryCreate = await prisma.category.createMany({
        data: req.body,
      });
      res.status(200).json({
        data: null,
        status: "success",
        total: 1,
      });
      console.log("success created", categoryCreate);
    } catch (err) {
      console.error(err);
    }
  },
);

app.delete<string, { id: string }, apiResponse<null>>(
  "/category/:id",
  async (req, res) => {
    try {
      const categoryDelete = await prisma.category.update({
        where: { id: req.params.id },
        data: {
          deletedAt: new Date(),
        },
      });
      console.log(
        `category id:${categoryDelete.id} name:${categoryDelete.name} is soft deleted`,
      );
      res.status(200).json({
        data: null,
        status: "success",
        total: 1,
      });
    } catch (err) {
      console.log(err);
    }
  },
);

app.put<string, { id: string }, apiResponse<null>>(
  "/category/:id",
  async (req, res) => {
    const categoryUpdate = await prisma.category.updateMany({
      where: { id: req.params.id },
      data: req.body,
    });

    console.log("updated successfull", categoryUpdate);
    res.status(200).json({
      data: null,
      status: "success",
      total: 1,
    });
  },
);

prisma
  .$connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error: Error) => {
    console.error("Error connecting to the database", error);
  })
  .finally(() => {
    prisma.$disconnect();
  });

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
