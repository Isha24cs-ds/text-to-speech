require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const { detectAmbiguity } = require('./clarification');
const { generateSQL } = require('./llm');
const { getSchema } = require('./schema');

const app = express();

app.use(cors());
app.use(express.json());

// Connect SQLite database
const db = new sqlite3.Database('./college.db');

// ---------- SQL Safety Check ----------
function isSafeSQL(sql) {
  const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER'];

  return !forbidden.some(word =>
    sql.toUpperCase().includes(word)
  );
}

// ---------- API Route ----------
app.post('/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    console.log('\\n------------------------------');
    console.log('User Question:', question);

    // Step 1: Read database schema dynamically
    const schema = await getSchema();

    console.log('Current Schema:', schema);

    // Step 2: Clarification engine
    const clarification = detectAmbiguity(question);

    if (clarification.needClarification) {
      console.log('Clarification needed:', clarification.clarification);

      return res.json({
        clarificationNeeded: true,
        clarification: clarification.clarification
      });
    }

    // Step 3: Generate SQL
    let sql = await generateSQL(question);

    sql = sql.trim();

    console.log('Generated SQL:', sql);

    // Step 4: Validate SQL
    if (!isSafeSQL(sql)) {
      return res.status(400).json({
        error: 'Only SELECT queries are allowed.',
        sql
      });
    }

    // Step 5: Execute SQL
    db.all(sql, [], (err, rows) => {

      if (err) {
        console.error('SQL Error:', err.message);

        return res.status(500).json({
          error: err.message,
          sql
        });
      }

      console.log('Rows returned:', rows.length);

      // Step 6: Send response
      res.json({
        clarificationNeeded: false,
        schema,
        sql,
        rows
      });
    });

  } catch (error) {
    console.error('Server Error:', error);

    res.status(500).json({
      error: error.message
    });
  }
});

// ---------- Health Check ----------
app.get('/', (req, res) => {
  res.send('Text-to-SQL Backend is running!');
});

// ---------- Start Server ----------
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});