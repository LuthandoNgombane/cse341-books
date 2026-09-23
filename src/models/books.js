import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
  const db = getDb();
  const collection = db.collection('books');
  const books = await collection.find({}).toArray();
  return books;
};

const getBookById = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');
  const book = await collection.findOne({ id: bookId });
  return book;
};

const authorExists = async (authorId) => {
  const db = getDb();
  const author = await db.collection('authors').findOne({ id: authorId });
  return !!author;
};

const createBook = async (book) => {
  const db = getDb();
  await db.collection('books').insertOne(book);
  const { _id, ...cleanBook } = book;
  return cleanBook;
};

const updateBook = async (id, bookData) => {
  const db = getDb();
  await db.collection('books').updateOne({ id }, { $set: bookData });
  return { id, ...bookData };
};

const deleteBook = async (id) => {
  const db = getDb();
  return await db.collection('books').deleteOne({ id });
};

export { getAllBooks, getBookById, authorExists, createBook, updateBook, deleteBook };