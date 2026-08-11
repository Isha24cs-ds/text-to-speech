const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./college.db');

function getSchema() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      [],
      (err, tables) => {
        if (err) return reject(err);

        const schema = {};
        let pending = tables.length;

        if (pending === 0) return resolve(schema);

        tables.forEach(table => {
          db.all(
            `PRAGMA table_info(${table.name})`,
            [],
            (err2, columns) => {
              if (err2) return reject(err2);

              schema[table.name] = columns.map(c => c.name);

              pending--;

              if (pending === 0) resolve(schema);
            }
          );
        });
      }
    );
  });
}

module.exports = { getSchema };