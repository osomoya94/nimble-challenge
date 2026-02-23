import { useState } from "react";
import { api } from "./api";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function testJobs() {
    setError("");
    setResult(null);
    try {
      const data = await api("/api/jobs/get-list");
      setResult(data);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={testJobs}>Probar GET jobs</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default App;
