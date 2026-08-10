const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSQL(question) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  const prompt = `
You are a SQLite SQL expert.

Database schema:
students(id, name, branch, cgpa, year)

Rules:
- Return ONLY SQL.
- Use SQLite syntax.
- Do not explain anything.
- Use LIMIT for top records.

Question: ${question}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text().trim();
}

module.exports = { generateSQL };