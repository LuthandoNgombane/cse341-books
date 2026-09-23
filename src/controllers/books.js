import { getAllBooks,getBookById } from '../models/books.js';

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const createBookHandler = async (req, res) => {
  try {
    const { id, authorId, title, publicationDate } = req.body;

    if (!id || !authorId || !title || !publicationDate) {
      return res.status(400).json({ message: 'Missing required book fields.' });
    }

    const existingBook = await getBookById(id);
    if (existingBook) {
      return res.status(400).json({ message: 'Book id already exists.' });
    }

    const validAuthor = await authorExists(authorId);
    if (!validAuthor) {
      return res.status(400).json({ message: 'authorId does not match an existing author.' });
    }

    const newBook = await createBook({ id, authorId, title, publicationDate });
    return res.status(201).json(newBook);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create book.' });
  }
};

const updateBookHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, title, publicationDate } = req.body;

    if (!authorId || !title || !publicationDate) {
      return res.status(400).json({ message: 'Missing required book fields.' });
    }

    const existingBook = await getBookById(id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const validAuthor = await authorExists(authorId);
    if (!validAuthor) {
      return res.status(400).json({ message: 'authorId does not match an existing author.' });
    }

    const updatedBook = await updateBook(id, { authorId, title, publicationDate });
    return res.status(200).json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update book.' });
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBook = await getBookById(id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    await deleteBook(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete book.' });
  }
};


export { getBooksHandler, getBookByIdHandler, createBookHandler, updateBookHandler, deleteBookHandler };