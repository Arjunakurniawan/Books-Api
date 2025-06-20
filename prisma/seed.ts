import { PrismaClient } from "../generated/prisma/client";
import { books } from "../DataDummy/books";

const prisma = new PrismaClient();

async function main() {
  console.log("start seeding.........");

  for (const book of books) {
    const upsertedBook = await prisma.book.upsert({
      where: { name: book.name },
      update: {
        name: book.name,
        description: book.description,
        image: book.image,
        price: book.price,
        stock: book.stock,
      },
      create: {
        name: book.name,
        description: book.description,
        image: book.image,
        price: book.price,
        stock: book.stock,
        categoryId: book.categoryId,
      },
    });
    console.log("seeding completed....", upsertedBook);
  }
  console.info("finished");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
