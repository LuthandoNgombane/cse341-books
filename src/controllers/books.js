import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
} from '../models/books.js';

const isValidBookId = (id) => {
  return typeof id === 'string' && /^b[1-9][0-9]{0,8}$/.test(id);
};

const isValidAuthorId = (id) => {
  return typeof id === 'string' && /^a[1-9][0-9]{0,8}$/.test(id);
};

const isValidPublicationDate = (value) => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const isLeapYear =
    year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <= daysInMonth[month - 1];
};

const validateBookBody = (body, isCreate) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  const allowedFields = isCreate
    ? ['id', 'authorId', 'title', 'publicationDate']
    : ['authorId', 'title', 'publicationDate'];

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

    if (field === 'id' && !isValidBookId(body.id)) {
      return 'Invalid id.';
    }

    if (field === 'authorId' && !isValidAuthorId(body.authorId)) {
      return 'Invalid authorId.';
    }

    if (field === 'title') {
      if (
        typeof body.title !== 'string' ||
        body.title.trim().length === 0 ||
        body.title.trim().length > 200
      ) {
        return 'Invalid title.';
      }
    }

    if (
      field === 'publicationDate' &&
      !isValidPublicationDate(body.publicationDate)
    ) {
      return 'Invalid publicationDate.';
    }
  }

  return null;
};

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();

    return res.status(200).json(books);
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getBookByIdHandler = async (req, res) => {
  const { id } = req.params;

  if (!isValidBookId(id)) {
    return res.status(400).json({ error: 'Invalid book id.' });
  }

  try {
    const book = await getBookById(id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    return res.status(200).json(book);
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createBookHandler = async (req, res) => {
  const validationError = validateBookBody(req.body, true);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const book = {
    id: req.body.id,
    authorId: req.body.authorId,
    title: req.body.title.trim(),
    publicationDate: req.body.publicationDate,
  };

  try {
    const existingBook = await getBookById(book.id);

    if (existingBook) {
      return res.status(400).json({ error: 'Book id already exists.' });
    }

    const hasAuthor = await authorExists(book.authorId);

    if (!hasAuthor) {
      return res.status(400).json({
        error: 'authorId must reference an existing author.',
      });
    }

    const createdBook = await createBook(book);

    return res.status(201).json(createdBook);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.id) {
      return res.status(400).json({ error: 'Book id already exists.' });
    }

    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateBookHandler = async (req, res) => {
  const { id } = req.params;

  if (!isValidBookId(id)) {
    return res.status(400).json({ error: 'Invalid book id.' });
  }

  const validationError = validateBookBody(req.body, false);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const updates = {
    authorId: req.body.authorId,
    title: req.body.title.trim(),
    publicationDate: req.body.publicationDate,
  };

  try {
    const existingBook = await getBookById(id);

    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const hasAuthor = await authorExists(updates.authorId);

    if (!hasAuthor) {
      return res.status(400).json({
        error: 'authorId must reference an existing author.',
      });
    }

    const updatedBook = await updateBook(id, updates);

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    return res.status(200).json(updatedBook);
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteBookHandler = async (req, res) => {
  const { id } = req.params;

  if (!isValidBookId(id)) {
    return res.status(400).json({ error: 'Invalid book id.' });
  }

  try {
    const result = await deleteBook(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
};