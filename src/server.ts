import express from "express";
import type {
  apiResponse,
  book,
  bookResponse,
  category,
  categoryResponse,
} from "../types/type";
import { prisma } from "../lib/prisma"

const app = express();
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

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
  }
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
  }
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
        `id:${bookDelete.id} BookName:${bookDelete.name} is softDeleted`
      );
    } catch (err) {
      console.error(err);
    }
  }
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
        `update Successfull  id: ${bookUpdate.id}  book: ${bookUpdate.name}`
      );
      res.status(200).json({ data: null, status: "success", total: 1 });
    } catch (err) {
      console.error(err);
    }
  }
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
  }
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
  }
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
  }
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
        `category id:${categoryDelete.id} name:${categoryDelete.name} is soft deleted`
      );
      res.status(200).json({
        data: null,
        status: "success",
        total: 1,
      });
    } catch (err) {
      console.log(err);
    }
  }
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
  }
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
