async function generateSQL(question) {
  let q = question.toLowerCase();

  // ---------- Normalize synonyms ----------
  q = q.replace(/greater than|more than|above|higher than/g, '>');
  q = q.replace(/less than|below|lower than/g, '<');
  q = q.replace(/topper|best students|highest cgpa students/g, 'top students');
  q = q.replace(/department/g, 'branch');
  q = q.replace(/branch wise|branch-wise|for each branch/g, 'branchwise');

  // ---------- Aggregate Queries ----------

  // Count students in each branch
  if (
    q.includes('count') &&
    q.includes('students') &&
    (q.includes('branchwise') || q.includes('each branch'))
  ) {
    return `
SELECT branch, COUNT(*) AS total_students
FROM students
GROUP BY branch;
    `;
  }

  // Average CGPA branch wise
  if (
    q.includes('average') &&
    q.includes('cgpa') &&
    q.includes('branchwise')
  ) {
    return `
SELECT branch, AVG(cgpa) AS avg_cgpa
FROM students
GROUP BY branch;
    `;
  }

  // Highest CGPA in each branch
  if (
    (q.includes('highest') || q.includes('maximum') || q.includes('max')) &&
    q.includes('cgpa') &&
    q.includes('branchwise')
  ) {
    return `
SELECT branch, MAX(cgpa) AS highest_cgpa
FROM students
GROUP BY branch;
    `;
  }

  // ---------- Simple CGPA Queries ----------

  let match = q.match(/cgpa\\s*>\\s*(\\d+(\\.\\d+)?)/);

  if (match) {
    return `
SELECT name, cgpa
FROM students
WHERE cgpa > ${match[1]};
    `;
  }

  match = q.match(/cgpa\\s*<\\s*(\\d+(\\.\\d+)?)/);

  if (match) {
    return `
SELECT name, cgpa
FROM students
WHERE cgpa < ${match[1]};
    `;
  }

  // ---------- Branch Queries ----------

  if (q.includes('cs-ds')) {
    return `
SELECT *
FROM students
WHERE branch = 'CS-DS';
    `;
  }

  if (q.includes('cse')) {
    return `
SELECT *
FROM students
WHERE branch = 'CSE';
    `;
  }

  if (q.includes('ece')) {
    return `
SELECT *
FROM students
WHERE branch = 'ECE';
    `;
  }

  // ---------- List all students ----------

  if (q.includes('all students')) {
    return `
SELECT *
FROM students;
    `;
  }

  // ---------- Top N students ----------

  match = q.match(/top (\\d+)/);

  if (match) {
    return `
SELECT name, cgpa
FROM students
ORDER BY cgpa DESC
LIMIT ${match[1]};
    `;
  }

  // ---------- Default ----------

  return `
SELECT *
FROM students;
  `;
}

module.exports = { generateSQL };