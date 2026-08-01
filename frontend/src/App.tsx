import { useState } from "react";

import "./App.css";
import { parseIssueUrl } from "./api/client";
import { IssueCreateForm } from "./components/issue-create-form";
import { IssueUrlForm } from "./components/issue-url-form";
import { StatusBanner } from "./components/status-banner";
import { IssueDetailPage } from "./pages/issue-detail-page";

interface Target {
  owner: string;
  repository: string;
  issueNumber: number;
}

type Mode = "load" | "create";

function App() {
  const [mode, setMode] = useState<Mode>("load");
  const [target, setTarget] = useState<Target | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<Error | null>(null);

  async function handleSubmit(url: string) {
    setParsing(true);
    setParseError(null);
    try {
      const result = await parseIssueUrl(url);
      setTarget({
        owner: result.owner,
        repository: result.repository,
        issueNumber: result.issue_number,
      });
    } catch (err) {
      setParseError(err as Error);
      setTarget(null);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="app">
      <h1 className="app__title">GitHub Issue Lifecycle</h1>

      <div className="app__mode-tabs">
        <button
          type="button"
          className={mode === "load" ? "active" : ""}
          onClick={() => setMode("load")}
        >
          Load existing Issue
        </button>
        <button
          type="button"
          className={mode === "create" ? "active" : ""}
          onClick={() => setMode("create")}
        >
          Report a new Issue (QA)
        </button>
      </div>

      {mode === "load" && (
        <>
          <IssueUrlForm onSubmit={handleSubmit} submitting={parsing} />
          {parseError && <StatusBanner error={parseError} />}
          {!target && !parseError && <StatusBanner empty />}
        </>
      )}

      {mode === "create" && (
        <IssueCreateForm
          onCreated={(owner, repository, issue) => {
            setTarget({ owner, repository, issueNumber: issue.number });
            setMode("load");
          }}
        />
      )}

      {target && (
        <IssueDetailPage
          owner={target.owner}
          repository={target.repository}
          issueNumber={target.issueNumber}
        />
      )}
    </div>
  );
}

export default App;
