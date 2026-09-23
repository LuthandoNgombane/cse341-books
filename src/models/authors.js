import { getDb } from '../db/connect.js';

const getAllAuthors = async () => {
  const db = getDb();
  return await db.collection('authors').find({}, { projection: { _id: 0 } }).toArray();
};

const getAuthorById = async (id) => {
  const db = getDb();
  return await db.collection('authors').findOne({ id }, { projection: { _id: 0 } });
};

const createAuthor = async (author) => {
  const db = getDb();
  await db.collection('authors').insertOne(author);
  const { _id, ...cleanAuthor } = author;
  return cleanAuthor;
};

const updateAuthor = async (id, authorData) => {
  const db = getDb();
  await db.collection('authors').updateOne({ id }, { $set: authorData });
  return { id, ...authorData };
};

const deleteAuthor = async (id) => {
  const db = getDb();
  return await db.collection('authors').deleteOne({ id });
};

const authorHasBooks = async (id) => {
  const db = getDb();
  const count = await db.collection('books').countDocuments({ authorId: id });
  return count > 0;
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  authorHasBooks
};