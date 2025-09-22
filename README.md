# Kalvium Student API

## What it is
Simple Student Management backend API. Supports:
- POST /api/students — add a student
- GET /api/students — list students

## Run locally
1. `git clone <repo-url>`
2. `cd kalvium-student-api`
3. `npm install`
4. `npm start`
5. Open `http://localhost:3000` (the static frontend if present) or use Postman to test.

## API Endpoints
### POST /api/students
Body (JSON):
- `name` (string, required)
- `age` (number > 0, required)
- `course` (string, required)
- `year` (string, required)
- `status` (string, optional, default: "active")

Example response: `201 Created` with created student JSON.

### GET /api/students
Returns: JSON array of student objects.

## Deployed URL
`https://student-api-[yourname].onrender.com`


## Notes
- Data persisted to `data/students.json`.
- If `students.json` is missing or corrupted, the server recovers by initializing an empty array and backing up the corrupted file.

