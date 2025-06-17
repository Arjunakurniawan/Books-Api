import { PrismaClient } from "../generated/prisma/client";
import express from "express";
import type { apiResponse, book, bookResponse } from "../types/type";

const prisma = new PrismaClient();

const app = express();

app.get<string, null, apiResponse<book[]>>("/books", async (_, res) => {
  try {
    const books = await prisma.book.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json({
      data: books,
      status: "success",
    });
  } catch (err) {
    console.error(err);
  }
});

app.use(express.json());

app.post<string, null, apiResponse<null>, bookResponse>(
  "/book/create",
  async (req, res) => {
    try {
      const bookCreate = await prisma.book.create({
        data: req.body,
      });
      res.status(200).json({
        data: null,
        status: "success",
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
      });
      console.log(
        `book id:${bookDelete.id} name:${bookDelete.name} is softDeleted`
      );
    } catch (err) {
      console.error(err);
    }
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
