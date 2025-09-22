// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

// Ensure data directory & file exist
async function ensureDataFile() {
  if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fsSync.existsSync(STUDENTS_FILE)) {
    await fs.writeFile(STUDENTS_FILE, '[]', 'utf8');
  }
}

// Read students safely
async function readStudents() {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(STUDENTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Backup corrupted file
      const backup = `${STUDENTS_FILE}.corrupt.${Date.now()}`;
      await fs.rename(STUDENTS_FILE, backup);
      await fs.writeFile(STUDENTS_FILE, '[]', 'utf8');
      console.error('students.json corrupted. Backed up to:', backup);
      return [];
    }
    throw err;
  }
}

// Write students safely
async function writeStudents(students) {
  await ensureDataFile();
  await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf8');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Root route (friendly message)
app.get('/', (req, res) => {
  res.send('✅ Student API is running! Use /api/students');
});

// ✅ Add a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, age, course, year, status } = req.body ?? {};

    // Validation
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Name is required and cannot be blank.' });
    }
    if (!course || String(course).trim() === '') {
      return res.status(400).json({ error: 'Course is required and cannot be blank.' });
    }
    if (!year || String(year).trim() === '') {
      return res.status(400).json({ error: 'Year is required and cannot be blank.' });
    }
    const numericAge = Number(age);
    if (!age || Number.isNaN(numericAge) || numericAge <= 0) {
      return res.status(400).json({ error: 'Age is required and must be a number greater than 0.' });
    }

    const newStudent = {
      id: uuidv4(),
      name: String(name).trim(),
      age: numericAge,
      course: String(course).trim(),
      year: String(year).trim(),
      status: status && String(status).trim() ? String(status).trim() : 'active',
      createdAt: new Date().toISOString()
    };

    const students = await readStudents();
    students.push(newStudent);
    await writeStudents(students);

    return res.status(201).json(newStudent);
  } catch (err) {
    console.error('POST /api/students error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await readStudents();
    return res.json(students);
  } catch (err) {
    console.error('GET /api/students error:', err);
    return res.status(500).json({ error: 'Could not read student list' });
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Student API listening on port ${PORT}`);
});
