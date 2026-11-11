import { getDb } from '../db/connect.js';

const getAllAuthors = async () => {
  const db = getDb();
  const collection = db.collection('authors');

  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray();
};

const getAuthorById = async (id) => {
  const db = getDb();
  const collection = db.collection('authors');

  return collection.findOne({ id }, { projection: { _id: 0 } });
};

const createAuthor = async (author) => {
  const db = getDb();
  const collection = db.collection('authors');

  const newAuthor = {
    id: author.id,
    name: author.name,
    birthYear: author.birthYear,
  };

  await collection.insertOne({ ...newAuthor });

  return newAuthor;
};

const updateAuthor = async (id, author) => {
  const db = getDb();
  const collection = db.collection('authors');

  const updates = {
    name: author.name,
    birthYear: author.birthYear,
  };

  const result = await collection.updateOne(
    { id },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return { id, ...updates };
};

const deleteAuthor = async (id) => {
  const db = getDb();
  const collection = db.collection('authors');

  return collection.deleteOne({ id });
};

const authorHasBooks = async (id) => {
  const db = getDb();
  const collection = db.collection('books');

  const book = await collection.findOne(
    { authorId: id },
    { projection: { _id: 1 } }
  );

  return book !== null;
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  authorHasBooks,
};