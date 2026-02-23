import { useState } from "react";
import { api } from "./api";
import "./App.css";

function App() {
  const [repoUrls, setRepoUrls] = useState({});
  const [submitMsg, setSubmitMsg] = useState({});
  const [applyLoading, setApplyLoading] = useState({});

  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState("");

  async function handleGetCandidate() {
    setError("");
    setCandidate(null);
    setJobs([]);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Ingresa tu email.");
      return;
    }

    setLoadingCandidate(true);
    try {
      const data = await api(
        `/api/candidate/get-by-email?email=${encodeURIComponent(cleanEmail)}`,
      );
      setCandidate(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingCandidate(false);
    }
  }

  async function handleGetJobs() {
    setError("");
    setJobs([]);

    setLoadingJobs(true);
    try {
      const data = await api("/api/jobs/get-list");
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingJobs(false);
    }
  }

  async function handleApply(jobId) {
    setSubmitMsg((prev) => ({ ...prev, [jobId]: "" }));

    if (!candidate?.uuid || !candidate?.candidateId) {
      setSubmitMsg((prev) => ({
        ...prev,
        [jobId]: "Primero busca el candidato.",
      }));
      return;
    }

    const repoUrl = (repoUrls[jobId] || "").trim();
    if (!repoUrl) {
      setSubmitMsg((prev) => ({
        ...prev,
        [jobId]: "Ingresa la URL del repo.",
      }));
      return;
    }

    setApplyLoading((prev) => ({ ...prev, [jobId]: true }));

    try {
      const body = {
        uuid: candidate.uuid,
        jobId: String(jobId),
        candidateId: candidate.candidateId,
        repoUrl,
      };

      const res = await api("/api/candidate/apply-to-job", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res?.ok === true) {
        setSubmitMsg((prev) => ({
          ...prev,
          [jobId]: "OK: postulacion enviada (ok:true)",
        }));
      } else {
        setSubmitMsg((prev) => ({
          ...prev,
          [jobId]: "Respuesta recibida, pero no fue ok:true",
        }));
      }
    } catch (e) {
      setSubmitMsg((prev) => ({ ...prev, [jobId]: `Error: ${e.message}` }));
    } finally {
      setApplyLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Nimble Challenge</h1>

      <h2>Step 2 — Obtener candidato</h2>
      <div style={{ display: "flex", gap: 8, maxWidth: 720 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-email@ejemplo.com"
        />
        <button onClick={handleGetCandidate} disabled={loadingCandidate}>
          {loadingCandidate ? "Cargando..." : "Buscar"}
        </button>
      </div>

      {candidate && (
        <>
          <p>
            <b>OK:</b> candidato encontrado — uuid:{" "}
            <code>{candidate.uuid}</code>
          </p>
          <pre>{JSON.stringify(candidate, null, 2)}</pre>
        </>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h2>Step 3 — Obtener lista de posiciones</h2>
      <button onClick={handleGetJobs} disabled={loadingJobs}>
        {loadingJobs ? "Cargando..." : "Traer posiciones"}
      </button>

      {jobs.length > 0 && (
        <>
          <p>Posiciones encontradas: {jobs.length}</p>

          <div
            style={{ marginTop: 12, display: "grid", gap: 12, maxWidth: 900 }}
          >
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {job.title}
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    jobId: <code>{job.id}</code>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    style={{ flex: 1, padding: 10 }}
                    placeholder="https://github.com/tu-usuario/tu-repo"
                    value={repoUrls[job.id] || ""}
                    onChange={(e) =>
                      setRepoUrls((prev) => ({
                        ...prev,
                        [job.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={!!applyLoading[job.id]}
                  >
                    {applyLoading[job.id] ? "Enviando..." : "Submit"}
                  </button>
                </div>

                {submitMsg[job.id] && (
                  <p style={{ marginTop: 8 }}>{submitMsg[job.id]}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
