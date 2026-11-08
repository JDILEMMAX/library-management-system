import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Historical Fiction', slug: 'historical-fiction' },
  { name: 'Non-Fiction', slug: 'non-fiction' },
];

const books = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0-441-17271-9',
    totalCopies: 4,
    availableCopies: 4,
    genreSlug: 'science-fiction',
  },
  {
    title: 'Neuromancer',
    author: 'William Gibson',
    isbn: '978-0-441-56956-4',
    totalCopies: 3,
    availableCopies: 3,
    genreSlug: 'science-fiction',
  },
  {
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    isbn: '978-0-441-47812-5',
    totalCopies: 2,
    availableCopies: 2,
    genreSlug: 'science-fiction',
  },
  {
    title: 'The Big Sleep',
    author: 'Raymond Chandler',
    isbn: '978-0-394-75828-5',
    totalCopies: 3,
    availableCopies: 3,
    genreSlug: 'mystery',
  },
  {
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    isbn: '978-0-307-58836-4',
    totalCopies: 5,
    availableCopies: 5,
    genreSlug: 'mystery',
  },
  {
    title: 'The Name of the Rose',
    author: 'Umberto Eco',
    isbn: '978-0-15-144647-6',
    totalCopies: 2,
    availableCopies: 2,
    genreSlug: 'mystery',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0-547-92822-7',
    totalCopies: 6,
    availableCopies: 6,
    genreSlug: 'fantasy',
  },
  {
    title: 'A Wizard of Earthsea',
    author: 'Ursula K. Le Guin',
    isbn: '978-0-547-72342-9',
    totalCopies: 3,
    availableCopies: 3,
    genreSlug: 'fantasy',
  },
  {
    title: 'The Lies of Locke Lamora',
    author: 'Scott Lynch',
    isbn: '978-0-553-58894-4',
    totalCopies: 2,
    availableCopies: 2,
    genreSlug: 'fantasy',
  },
  {
    title: 'The Pillars of the Earth',
    author: 'Ken Follett',
    isbn: '978-0-451-16689-5',
    totalCopies: 3,
    availableCopies: 3,
    genreSlug: 'historical-fiction',
  },
  {
    title: 'All the Light We Cannot See',
    author: 'Anthony Doerr',
    isbn: '978-1-4767-4658-6',
    totalCopies: 4,
    availableCopies: 4,
    genreSlug: 'historical-fiction',
  },
  {
    title: 'Wolf Hall',
    author: 'Hilary Mantel',
    isbn: '978-0-312-42931-5',
    totalCopies: 2,
    availableCopies: 2,
    genreSlug: 'historical-fiction',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0-06-231609-7',
    totalCopies: 5,
    availableCopies: 5,
    genreSlug: 'non-fiction',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    isbn: '978-0-13-595705-9',
    totalCopies: 4,
    availableCopies: 4,
    genreSlug: 'non-fiction',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0-374-53355-7',
    totalCopies: 3,
    availableCopies: 3,
    genreSlug: 'non-fiction',
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    isbn: '978-0-525-55947-4',
    totalCopies: 4,
    availableCopies: 4,
    genreSlug: 'fantasy',
  },
];

async function main() {
  console.log('Seeding genres...');
  const genreMap: Record<string, number> = {};

  for (const genre of genres) {
    const record = await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: { name: genre.name },
      create: genre,
    });
    genreMap[genre.slug] = record.id;
  }

  console.log('Seeding books...');
  for (const book of books) {
    const { genreSlug, ...bookData } = book;
    await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {
        title: bookData.title,
        author: bookData.author,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.availableCopies,
        genreId: genreMap[genreSlug],
      },
      create: {
        ...bookData,
        genreId: genreMap[genreSlug],
      },
    });
  }

  console.log(`Seed complete: ${genres.length} genres, ${books.length} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
