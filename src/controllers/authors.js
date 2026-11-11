import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorInDb,
  updateAuthor as updateAuthorInDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks,
} from '../models/authors.js';

const isValidAuthorId = (id) => {
  return typeof id === 'string' && /^a[1-9][0-9]{0,8}$/.test(id);
};

const validateAuthorBody = (body, isCreate) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  const allowedFields = isCreate
    ? ['id', 'name', 'birthYear']
    : ['name', 'birthYear'];

  const unexpectedField = Object.keys(body).find(
    (field) => {return !allowedFields.includes(field)}
  );

  if (unexpectedField !== undefined) {
    return `Unexpected field: ${unexpectedField}.`;
  }

  for (const field of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      return `${field} is required.`;
    }

    if (field === 'id' && !isValidAuthorId(body.id)) {
      return 'Invalid id.';
    }

    if (field === 'name') {
      if (
        typeof body.name !== 'string' ||
        body.name.trim().length === 0 ||
        body.name.trim().length > 150
      ) {
        return 'Invalid name.';
      }
    }

    if (field === 'birthYear') {
      const currentYear = new Date().getUTCFullYear();

      if (
        !Number.isInteger(body.birthYear) ||
        body.birthYear < 1 ||
        body.birthYear > currentYear
      ) {
        return 'Invalid birthYear.';
      }
    }
  }

  return null;
};

const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json(authors);
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAuthorById = async (req, res) => {
  const { id } = req.params;

  if (!isValidAuthorId(id)) {
    return res.status(400).json({ error: 'Invalid author id.' });
  }

  try {
    const author = await getAuthorByIdFromDb(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    return res.status(200).json(author);
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createAuthor = async (req, res) => {
  const validationError = validateAuthorBody(req.body, true);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const author = {
    id: req.body.id,
    name: req.body.name.trim(),
    birthYear: req.body.birthYear,
  };

  try {
    const existingAuthor = await getAuthorByIdFromDb(author.id);

    if (existingAuthor) {
      return res.status(400).json({ error: 'Author id already exists.' });
    }

    const createdAuthor = await createAuthorInDb(author);

    return res.status(201).json(createdAuthor);
  } catch (error) {
    // Handle a duplicate custom id enforced by MongoDB's unique index.
    if (error.code === 11000 && error.keyPattern?.id) {
      return res.status(400).json({ error: 'Author id already exists.' });
    }

    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateAuthor = async (req, res) => {
  const { id } = req.params;

  if (!isValidAuthorId(id)) {
    return res.status(400).json({ error: 'Invalid author id.' });
  }

  const validationError = validateAuthorBody(req.body, false);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const updates = {
    name: req.body.name.trim(),
    birthYear: req.body.birthYear,
  };

  try {
    const updatedAuthor = await updateAuthorInDb(id, updates);

    if (!updatedAuthor) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    return res.status(200).json(updatedAuthor);
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteAuthor = async (req, res) => {
  const { id } = req.params;

  if (!isValidAuthorId(id)) {
    return res.status(400).json({ error: 'Invalid author id.' });
  }

  try {
    const author = await getAuthorByIdFromDb(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    const hasBooks = await authorHasBooks(id);

    if (hasBooks) {
      return res.status(409).json({
        error: 'Cannot delete an author who has books.',
      });
    }

    const result = await deleteAuthorFromDb(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Author not found.' });
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};