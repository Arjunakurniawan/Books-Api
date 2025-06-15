import { PrismaClient } from "../generated/prisma/client";
import express from "express";

const prisma = new PrismaClient();

const app = express();

app.get("/books", (req, res) => {
  
})

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
