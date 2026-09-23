# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:
```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:
```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

---

## Feature 2: Author CRUD Operations

### Goal
Add a new `authors` collection and implement complete CRUD operations for authors using custom string identifiers. Authors must be integrated with Swagger documentation for full browser-based testing.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`
- `name`: string, required, full name of the author
- `birthYear`: number, required, integer representing the birth year (e.g., 1892)

Authors will use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Books
Authors are referenced by books via the `authorId` field.

To maintain relational integrity, when a client attempts to delete an author (`DELETE /authors/:id`), the API must check the `books` collection first:
- If one or more books reference this author's `id`, reject the deletion with status code `400` and an informative error message.
- The author can only be deleted if no books reference their `id`.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by their custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:
```json
{
  "id": "a3",
  "name": "J.R.R. Tolkien",
  "birthYear": 1892
}
```

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if a required field is missing or invalid
- `400` if the `id` already exists
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:
```json
{
  "name": "John Ronald Reuel Tolkien",
  "birthYear": 1892
}
```

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if a required field is missing or invalid
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `400` if the author is currently referenced by one or more books
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route.

---

# Books API Week 02 Spec - Version 2 (Implementation Specification)

### Global Architecture & Standards
1. **Identifiers**: All routes reference custom string IDs (`id`). MongoDB default `_id` values must be excluded from responses (`{ projection: { _id: 0 } }`).
2. **Standard Error Schema**: All error responses return JSON:
   ```json
   { "message": "Description of error" }
   ```
3. **Database Collections**: `books` and `authors` in the same MongoDB database.

---

## 1. Books API Specification

### Data Model
| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique, immutable, format: `b[0-9]+` |
| `authorId` | string | Required, must match an existing author's `id` |
| `title` | string | Required, non-empty string |
| `publicationDate` | string | Required, format `YYYY-MM-DD` |

### Endpoints

#### `GET /books`
- **Response `200`**: Array of book objects (empty array if no books).
- **Response `500`**: `{"message": "Unable to retrieve books"}`

#### `GET /books/:id`
- **Parameters**: `id` (path, string, required)
- **Response `200`**: Matched book object.
- **Response `404`**: `{"message": "Book not found"}`
- **Response `500`**: `{"message": "Unable to retrieve book"}`

#### `POST /books`
- **Request Body**:
  ```json
  {
    "id": "b4",
    "authorId": "a1",
    "title": "Clean Architecture",
    "publicationDate": "2017-09-20"
  }
  ```
- **Validation**:
  - Must include `id`, `authorId`, `title`, and `publicationDate`.
  - `id` must not already exist in `books`.
  - `authorId` must exist in `authors`.
- **Response `201`**: Created book object.
- **Response `400`**: `{"message": "Missing required fields or invalid authorId/id"}`
- **Response `500`**: `{"message": "Unable to create book"}`

#### `PUT /books/:id`
- **Parameters**: `id` (path, string, required)
- **Request Body**:
  ```json
  {
    "authorId": "a1",
    "title": "Clean Architecture: A Craftsman's Guide",
    "publicationDate": "2017-09-20"
  }
  ```
- **Validation**:
  - Must include `authorId`, `title`, and `publicationDate`.
  - `authorId` must exist in `authors`.
- **Response `200`**: Updated book object.
- **Response `400`**: `{"message": "Missing required fields or invalid authorId"}`
- **Response `404`**: `{"message": "Book not found"}`
- **Response `500`**: `{"message": "Unable to update book"}`

#### `DELETE /books/:id`
- **Parameters**: `id` (path, string, required)
- **Response `204`**: No content.
- **Response `404`**: `{"message": "Book not found"}`
- **Response `500`**: `{"message": "Unable to delete book"}`

---

## 2. Authors API Specification

### Data Model
| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique, immutable, format: `a[0-9]+` |
| `name` | string | Required, non-empty string |
| `birthYear` | integer | Required, integer between 0 and current year |

### Endpoints

#### `GET /authors`
- **Response `200`**: Array of author objects.
- **Response `500`**: `{"message": "Unable to retrieve authors"}`

#### `GET /authors/:id`
- **Parameters**: `id` (path, string, required)
- **Response `200`**: Matched author object.
- **Response `404`**: `{"message": "Author not found"}`
- **Response `500`**: `{"message": "Unable to retrieve author"}`

#### `POST /authors`
- **Request Body**:
  ```json
  {
    "id": "a1",
    "name": "Robert C. Martin",
    "birthYear": 1952
  }
  ```
- **Validation**:
  - Must include `id`, `name`, and valid numeric `birthYear`.
  - `id` must not already exist in `authors`.
- **Response `201`**: Created author object.
- **Response `400`**: `{"message": "Missing required fields or author ID already exists"}`
- **Response `500`**: `{"message": "Unable to create author"}`

#### `PUT /authors/:id`
- **Parameters**: `id` (path, string, required)
- **Request Body**:
  ```json
  {
    "name": "Uncle Bob",
    "birthYear": 1952
  }
  ```
- **Validation**:
  - Must include `name` and numeric `birthYear`.
- **Response `200`**: Updated author object.
- **Response `400`**: `{"message": "Missing or invalid author fields"}`
- **Response `404`**: `{"message": "Author not found"}`
- **Response `500`**: `{"message": "Unable to update author"}`

#### `DELETE /authors/:id`
- **Parameters**: `id` (path, string, required)
- **Relational Integrity Check**:
  - Query `books` for `{ authorId: id }`.
  - If count > 0, return `400`.
- **Response `204`**: No content.
- **Response `400`**: `{"message": "Cannot delete author with associated books"}`
- **Response `404`**: `{"message": "Author not found"}`
- **Response `500`**: `{"message": "Unable to delete author"}`