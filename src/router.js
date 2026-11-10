import express from 'express';
import { getBooksHandler , getBookByIdHandler } from './controllers/books.js';
import { getAllAuthors } from './controllers/authors.js';


const router = express.Router();

router.get('/books', getBooksHandler);

router.get('/books/:id', getBookByIdHandler);

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags:
 *       - Authors
 *     responses:
 *       200:
 *         description: A list of authors
 *       500:
 *         description: Unable to retrieve authors
 */
router.get('/authors', getAllAuthors);

export default router;