import { useState } from 'react';

export default function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      setResult(data);

    } catch (err) {
      setResult({ error: err.message });
    }

    setLoading(false);
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      fontFamily: 'Arial',
      padding: 20
    }}>

      <h1>Text to SQL with Clarification Engine</h1>

      <textarea
        rows={4}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder='Ask a question about the database...'
        style={{
          width: '100%',
          padding: 10,
          fontSize: 16
        }}
      />

      <button
        onClick={askQuestion}
        style={{
          marginTop: 10,
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Generate SQL'}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>

          {result.clarificationNeeded ? (
            <div style={{
              border: '1px solid orange',
              padding: 15,
              borderRadius: 8,
              background: '#fff8e1'
            }}>
              <h3>Clarification Needed</h3>
              <p>{result.clarification}</p>
            </div>

          ) : (
            <>
              <h3>Generated SQL</h3>

              <pre style={{
                background: '#f4f4f4',
                padding: 10,
                borderRadius: 8
              }}>
                {result.sql}
              </pre>

              <h3>Result</h3>

              <pre style={{
                background: '#f4f4f4',
                padding: 10,
                borderRadius: 8
              }}>
                {JSON.stringify(result.rows, null, 2)}
              </pre>
            </>
          )}

          {result.error && (
            <div style={{ color: 'red' }}>
              <h3>Error</h3>
              <p>{result.error}</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}