require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const { detectAmbiguity } = require('./clarification');
const { generateSQL } = require('./llm');

const app = express();

app.use(cors());
app.use(express.json());

// Connect SQLite database
const db = new sqlite3.Database('./college.db');

// Safety check
function isSafeSQL(sql) {
  const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER'];

  return !forbidden.some(word =>
    sql.toUpperCase().includes(word)
  );
}

// API endpoint
app.post('/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    // Step 1: Clarification check
    const clarification = detectAmbiguity(question);

    if (clarification.needClarification) {
      return res.json({
        clarificationNeeded: true,
        clarification: clarification.clarification
      });
    }

    // Step 2: Generate SQL
    let sql = await generateSQL(question);

    // Remove markdown if Gemini returns ```sql
    sql = sql.replace(/```sql|```/g, '').trim();

    // Step 3: Safety validation
    if (!isSafeSQL(sql)) {
      return res.status(400).json({
        error: 'Only SELECT queries are allowed.',
        sql
      });
    }

    // Step 4: Execute SQL
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql
        });
      }

      res.json({
        clarificationNeeded: false,
        sql,
        rows
      });
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});