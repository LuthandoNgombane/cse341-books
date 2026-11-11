import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
  const db = getDb();
  const collection = db.collection('books');

  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray();
};

const getBookById = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');

  return collection.findOne(
    { id: bookId },
    { projection: { _id: 0 } }
  );
};

const createBook = async (book) => {
  const db = getDb();
  const collection = db.collection('books');

  const newBook = {
    id: book.id,
    authorId: book.authorId,
    title: book.title,
    publicationDate: book.publicationDate,
  };

  await collection.insertOne({ ...newBook });

  return newBook;
};

const updateBook = async (bookId, book) => {
  const db = getDb();
  const collection = db.collection('books');

  const updates = {
    authorId: book.authorId,
    title: book.title,
    publicationDate: book.publicationDate,
  };

  const result = await collection.updateOne(
    { id: bookId },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return { id: bookId, ...updates };
};

const deleteBook = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');

  return collection.deleteOne({ id: bookId });
};

const authorExists = async (authorId) => {
  const db = getDb();
  const collection = db.collection('authors');

  const author = await collection.findOne(
    { id: authorId },
    { projection: { _id: 1 } }
  );

  return author !== null;
};

export {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
};