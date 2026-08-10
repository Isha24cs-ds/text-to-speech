const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./college.db');

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS students`);

  db.run(`
    CREATE TABLE students (
      id INTEGER PRIMARY KEY,
      name TEXT,
      branch TEXT,
      cgpa REAL,
      year INTEGER
    )
  `);

  const stmt = db.prepare(`INSERT INTO students VALUES (?, ?, ?, ?, ?)`);

  stmt.run(1, 'Isha', 'CS-DS', 9.16, 2);
  stmt.run(2, 'Rahul', 'CSE', 8.40, 3);
  stmt.run(3, 'Ananya', 'ECE', 7.90, 2);
  stmt.run(4, 'Aman', 'CS-DS', 8.95, 4);

  stmt.finalize();
});

db.close();

console.log('Database created successfully');