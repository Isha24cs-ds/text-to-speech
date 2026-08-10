function detectAmbiguity(question) {
  const q = question.toLowerCase();

  // Example: "Show top students"
  if (q.includes('top') && !q.match(/\d+/)) {
    return {
      needClarification: true,
      clarification: 'How many top records should I show?'
    };
  }

  // Example: "top students" without ranking criteria
  if (q.includes('top students') && !q.includes('cgpa')) {
    return {
      needClarification: true,
      clarification: 'Should I rank students by CGPA?'
    };
  }

  return { needClarification: false };
}

module.exports = { detectAmbiguity };