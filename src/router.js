import express from 'express';
import {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} from './controllers/books.js';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from './controllers/authors.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       additionalProperties: false
 *       required: [id, authorId, title, publicationDate]
 *       properties:
 *         id:
 *           type: string
 *           pattern: '^b[1-9][0-9]{0,8}$'
 *           example: b4
 *         authorId:
 *           type: string
 *           pattern: '^a[1-9][0-9]{0,8}$'
 *           description: Must reference an existing author's custom id.
 *           example: a1
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Trimmed before storage; must not be blank.
 *           example: Example Book Title
 *         publicationDate:
 *           type: string
 *           format: date
 *           description: Valid Gregorian date in YYYY-MM-DD format, years 0001–9999. Future dates are allowed.
 *           example: '2026-01-15'
 *     BookUpdate:
 *       type: object
 *       additionalProperties: false
 *       required: [authorId, title, publicationDate]
 *       properties:
 *         authorId:
 *           type: string
 *           pattern: '^a[1-9][0-9]{0,8}$'
 *           description: Must reference an existing author's custom id.
 *           example: a2
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Trimmed before storage; must not be blank.
 *           example: Updated Book Title
 *         publicationDate:
 *           type: string
 *           format: date
 *           description: Valid Gregorian date in YYYY-MM-DD format, years 0001–9999. Future dates are allowed.
 *           example: '2026-02-20'
 *     BookApiError:
 *       type: object
 *       additionalProperties: false
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 *   parameters:
 *     BookId:
 *       in: path
 *       name: id
 *       required: true
 *       description: Custom book id, not a MongoDB ObjectId.
 *       schema:
 *         type: string
 *         pattern: '^b[1-9][0-9]{0,8}$'
 *       example: b4
 *   responses:
 *     BookBadRequest:
 *       description: Invalid path id, request body, duplicate id, or missing referenced author.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookApiError'
 *           examples:
 *             invalidPath:
 *               value:
 *                 error: Invalid book id.
 *             missingField:
 *               value:
 *                 error: title is required.
 *             invalidField:
 *               value:
 *                 error: Invalid publicationDate.
 *             unexpectedField:
 *               value:
 *                 error: 'Unexpected field: id.'
 *             duplicateId:
 *               value:
 *                 error: Book id already exists.
 *             missingAuthor:
 *               value:
 *                 error: authorId must reference an existing author.
 *             invalidJson:
 *               value:
 *                 error: Invalid JSON body.
 *             invalidBody:
 *               value:
 *                 error: Request body must be a JSON object.
 *     BookNotFound:
 *       description: No book exists with the supplied custom id.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookApiError'
 *           example:
 *             error: Book not found.
 *     BookServerError:
 *       description: Unexpected server or database error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookApiError'
 *           example:
 *             error: Internal server error.
 *     BookPayloadTooLarge:
 *       description: Request body exceeds 10 KiB.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookApiError'
 *           example:
 *             error: Request body too large.
 *     BookUnsupportedMediaType:
 *       description: Missing or unsupported Content-Type. Use application/json; a charset parameter is allowed.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookApiError'
 *           example:
 *             error: Content-Type must be application/json.
 */

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Get all books
 *     description: Returns books sorted lexicographically by custom id, without MongoDB _id.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: An array of books, or an empty array.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *             examples:
 *               books:
 *                 value:
 *                   - id: b4
 *                     authorId: a1
 *                     title: Example Book Title
 *                     publicationDate: '2026-01-15'
 *               empty:
 *                 value: []
 *       500:
 *         $ref: '#/components/responses/BookServerError'
 */
router.get('/books', getBooksHandler);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get one book
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/BookId'
 *     responses:
 *       200:
 *         description: The matching book.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *             example:
 *               id: b4
 *               authorId: a1
 *               title: Example Book Title
 *               publicationDate: '2026-01-15'
 *       400:
 *         $ref: '#/components/responses/BookBadRequest'
 *       404:
 *         $ref: '#/components/responses/BookNotFound'
 *       500:
 *         $ref: '#/components/responses/BookServerError'
 */
router.get('/books/:id', getBookByIdHandler);

/**
 * @openapi
 * /books:
 *   post:
 *     summary: Create a book
 *     description: Requires all four fields, a unique book id, and an existing author. JSON body limit is 10 KiB.
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *           example:
 *             id: b4
 *             authorId: a1
 *             title: Example Book Title
 *             publicationDate: '2026-01-15'
 *     responses:
 *       201:
 *         description: The newly created book.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *             example:
 *               id: b4
 *               authorId: a1
 *               title: Example Book Title
 *               publicationDate: '2026-01-15'
 *       400:
 *         $ref: '#/components/responses/BookBadRequest'
 *       413:
 *         $ref: '#/components/responses/BookPayloadTooLarge'
 *       415:
 *         $ref: '#/components/responses/BookUnsupportedMediaType'
 *       500:
 *         $ref: '#/components/responses/BookServerError'
 */
router.post('/books', createBookHandler);

/**
 * @openapi
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     description: All three editable fields are required. The book id cannot change. The author must exist. Does not create missing books. An unchanged valid update returns 200. JSON body limit is 10 KiB.
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/BookId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookUpdate'
 *           example:
 *             authorId: a2
 *             title: Updated Book Title
 *             publicationDate: '2026-02-20'
 *     responses:
 *       200:
 *         description: The updated book, preserving its custom id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *             example:
 *               id: b4
 *               authorId: a2
 *               title: Updated Book Title
 *               publicationDate: '2026-02-20'
 *       400:
 *         $ref: '#/components/responses/BookBadRequest'
 *       404:
 *         $ref: '#/components/responses/BookNotFound'
 *       413:
 *         $ref: '#/components/responses/BookPayloadTooLarge'
 *       415:
 *         $ref: '#/components/responses/BookUnsupportedMediaType'
 *       500:
 *         $ref: '#/components/responses/BookServerError'
 */
router.put('/books/:id', updateBookHandler);

/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Deletes only the book. Its author remains unchanged. Repeated deletion returns 404.
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/BookId'
 *     responses:
 *       204:
 *         description: Book deleted. No response body.
 *       400:
 *         $ref: '#/components/responses/BookBadRequest'
 *       404:
 *         $ref: '#/components/responses/BookNotFound'
 *       500:
 *         $ref: '#/components/responses/BookServerError'
 */
router.delete('/books/:id', deleteBookHandler);

/**
 * @openapi
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       additionalProperties: false
 *       required: [id, name, birthYear]
 *       properties:
 *         id:
 *           type: string
 *           pattern: '^a[1-9][0-9]{0,8}$'
 *           example: a1
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 150
 *           description: Author name, trimmed before storage.
 *           example: Jane Austen
 *         birthYear:
 *           type: integer
 *           minimum: 1
 *           description: Must not exceed the current UTC calendar year.
 *           example: 1775
 *     AuthorUpdate:
 *       type: object
 *       additionalProperties: false
 *       required: [name, birthYear]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 150
 *           description: Author name, trimmed before storage.
 *           example: Updated Author Name
 *         birthYear:
 *           type: integer
 *           minimum: 1
 *           description: Must not exceed the current UTC calendar year.
 *           example: 1981
 *     AuthorApiError:
 *       type: object
 *       additionalProperties: false
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 *   parameters:
 *     AuthorId:
 *       in: path
 *       name: id
 *       required: true
 *       description: Custom author id, not a MongoDB ObjectId.
 *       schema:
 *         type: string
 *         pattern: '^a[1-9][0-9]{0,8}$'
 *       example: a1
 *   responses:
 *     AuthorBadRequest:
 *       description: Invalid path id, request body, field value, or duplicate id.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorApiError'
 *           examples:
 *             invalidPath:
 *               value:
 *                 error: Invalid author id.
 *             missingField:
 *               value:
 *                 error: name is required.
 *             invalidField:
 *               value:
 *                 error: Invalid birthYear.
 *             unexpectedField:
 *               value:
 *                 error: 'Unexpected field: id.'
 *             duplicateId:
 *               value:
 *                 error: Author id already exists.
 *             invalidJson:
 *               value:
 *                 error: Invalid JSON body.
 *             invalidBody:
 *               value:
 *                 error: Request body must be a JSON object.
 *     AuthorNotFound:
 *       description: No author exists with the supplied custom id.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorApiError'
 *           example:
 *             error: Author not found.
 *     AuthorServerError:
 *       description: Unexpected server or database error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorApiError'
 *           example:
 *             error: Internal server error.
 *     AuthorPayloadTooLarge:
 *       description: Request body exceeds 10 KiB.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorApiError'
 *           example:
 *             error: Request body too large.
 *     AuthorUnsupportedMediaType:
 *       description: Missing or unsupported Content-Type.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorApiError'
 *           example:
 *             error: Content-Type must be application/json.
 */

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Get all authors
 *     description: Returns authors sorted lexicographically by custom id.
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: An array of authors, or an empty array.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *             examples:
 *               authors:
 *                 value:
 *                   - id: a1
 *                     name: Jane Austen
 *                     birthYear: 1775
 *               empty:
 *                 value: []
 *       500:
 *         $ref: '#/components/responses/AuthorServerError'
 */
router.get('/authors', getAllAuthors);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Get one author
 *     tags: [Authors]
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorId'
 *     responses:
 *       200:
 *         description: The matching author.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *             example:
 *               id: a1
 *               name: Jane Austen
 *               birthYear: 1775
 *       400:
 *         $ref: '#/components/responses/AuthorBadRequest'
 *       404:
 *         $ref: '#/components/responses/AuthorNotFound'
 *       500:
 *         $ref: '#/components/responses/AuthorServerError'
 */
router.get('/authors/:id', getAuthorById);

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Create an author
 *     description: Requires a unique custom id and all author fields. JSON body limit is 10 KiB.
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *           example:
 *             id: a4
 *             name: Example Author
 *             birthYear: 1980
 *     responses:
 *       201:
 *         description: The newly created author.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *             example:
 *               id: a4
 *               name: Example Author
 *               birthYear: 1980
 *       400:
 *         $ref: '#/components/responses/AuthorBadRequest'
 *       413:
 *         $ref: '#/components/responses/AuthorPayloadTooLarge'
 *       415:
 *         $ref: '#/components/responses/AuthorUnsupportedMediaType'
 *       500:
 *         $ref: '#/components/responses/AuthorServerError'
 */
router.post('/authors', createAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     summary: Update an author
 *     description: Both editable fields are required. The id cannot change. An unchanged valid update returns 200. JSON body limit is 10 KiB.
 *     tags: [Authors]
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorUpdate'
 *           example:
 *             name: Updated Author Name
 *             birthYear: 1981
 *     responses:
 *       200:
 *         description: The updated author, preserving the route id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *             example:
 *               id: a1
 *               name: Updated Author Name
 *               birthYear: 1981
 *       400:
 *         $ref: '#/components/responses/AuthorBadRequest'
 *       404:
 *         $ref: '#/components/responses/AuthorNotFound'
 *       413:
 *         $ref: '#/components/responses/AuthorPayloadTooLarge'
 *       415:
 *         $ref: '#/components/responses/AuthorUnsupportedMediaType'
 *       500:
 *         $ref: '#/components/responses/AuthorServerError'
 */
router.put('/authors/:id', updateAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     description: Authors with books cannot be deleted. Reassign or delete their books first. A blocked deletion changes neither collection.
 *     tags: [Authors]
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorId'
 *     responses:
 *       204:
 *         description: Author deleted. No response body.
 *       400:
 *         $ref: '#/components/responses/AuthorBadRequest'
 *       404:
 *         $ref: '#/components/responses/AuthorNotFound'
 *       409:
 *         description: At least one book references this author.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorApiError'
 *             example:
 *               error: Cannot delete an author who has books.
 *       500:
 *         $ref: '#/components/responses/AuthorServerError'
 */
router.delete('/authors/:id', deleteAuthor);

export default router;