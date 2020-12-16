import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Redirect() {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [teamId, setTeamId] = useState("");
  const [configurationId, setConfigurationId] = useState("");
  const [next, setNext] = useState("");

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const configurationId = params.get("configurationId");
    const next = params.get("next");
    const teamId = params.get("teamId") || "";

    if (!(code && configurationId && next)) {
      throw new Error("Missing required integration URL params");
    }
    console.debug("useEffect found", { code, configurationId, next });
    setLoading(false);
    setConfigurationId(configurationId);
    setNext(next);
    setCode(code);
    setTeamId(teamId);
  }, []);

  useEffect(() => {
    if (!code) return;
    if (token) return;
    setLoading(true);
    const fn = async () => {
      const params = {
        configurationId,
        code,
        teamId,
      };
      const query = paramsToQuery(params);
      const res = await fetch(`/api/callback?${query}`);
      if (!res.ok) {
        throw new Error("Failed to get access token");
      }
      const json = await res.json();
      console.debug("callback", { json });
      setToken(json.token);
      setProjects(json.projects.projects);
      setLoading(false);
    };
    fn();
  }, [code]);

  const getEnvKey = (target) => {
    return `DEMO_${target}`;
  };

  const setEnv = async (
    project: any,
    target: string,
    method: string,
    envId: string = null
  ) => {
    const key = getEnvKey(target);
    const value = `DEMO_VAL_${Date.now()}`;
    const projectId = project.id;
    const params = {
      configurationId,
      envId,
      key,
      method,
      projectId,
      target,
      teamId,
      token,
      value,
    };
    const query = paramsToQuery(params);
    const url = `/api/setEnvVars?${query}`;
    console.debug("setEnv", { project, url, params });
    const res = await fetch(url);
    const json = await res.json();
    console.debug("setEnv res json", { json });
    const projects = json.projects.projects;
    setProjects(projects);
  };

  return (
    <Page>
      {loading ? (
        <h3>Loading access token...</h3>
      ) : (
        <div>
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Production Env</th>
                  <th>Preview Env</th>
                  <th>Development Env</th>
                </tr>
              </thead>
              {projects.sort().map((project) => (
                <tbody key={project.id}>
                  <tr>
                    <td colSpan={3} style={{ background: "#eee" }}>
                      Project: {project.name}
                    </td>
                  </tr>
                  <tr>
                    {["production", "preview", "development"].map((target) => {
                      const envVar = project.env
                        ? project.env.find((p) => p.key == getEnvKey(target))
                        : null;
                      return (
                        <td key={target}>
                          <input
                            disabled
                            value={envVar ? envVar.value : "NOT SET"}
                          />
                          <button
                            onClick={() =>
                              setEnv(
                                project,
                                target,
                                envVar ? "PATCH" : "POST",
                                envVar ? envVar.id : undefined
                              )
                            }
                            title={envVar ? "Edit" : "Create"}
                          >
                            {envVar ? "✍" : "➕"}
                          </button>
                          <button
                            disabled={!envVar}
                            onClick={() => setEnv(project, target, "DELETE")}
                            title="Remove"
                          >
                            🗑️
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              ))}
            </table>
          </div>

          <div style={{ margin: "0 auto", textAlign: "center" }}>
            <button
              onClick={() => {
                console.debug("All Done, going to", { next });
                window.location.href = next;
              }}
              style={{ fontSize: "2rem" }}
            >
              All Done → back to Vercel
            </button>
          </div>

          <div className={styles.card} style={{ fontSize: "0.7rem" }}>
            <h5>debug</h5>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>configurationId</td>
                  <td>{configurationId}</td>
                </tr>
                <tr>
                  <td>token</td>
                  <td>{token}</td>
                </tr>
                <tr>
                  <td>next</td>
                  <td>{next}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Page>
  );
}

const Page = ({ children }) => (
  <div className={styles.container}>
    <Head>
      <title>Integration Demo</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className={styles.main}>
      <h1 className={styles.title}>Integration Demo</h1>
      {children}
    </main>
    <footer className={styles.footer}>
      <a
        href="https://vercel.com?utm_source=vercel-integration-test&utm_medium=default-template&utm_campaign=vercel-integration-test"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{" "}
        <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
      </a>
    </footer>
  </div>
);

const paramsToQuery = (params: Object) => {
  return Object.keys(params)
    .map((key) => key + "=" + params[key])
    .join("&");
};
