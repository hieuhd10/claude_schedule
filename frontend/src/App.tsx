import { useState } from "react";

import "./App.css";
import { parseIssueUrl } from "./api/client";
import { Card } from "./design-system/lift-tailux";
import { IssueCreateForm } from "./components/issue-create-form";
import { IssueUrlForm } from "./components/issue-url-form";
import { StatusBanner } from "./components/status-banner";
import { RepoCredentialManager } from "./components/repo-credential-manager";
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
      <header className="app__header flex justify-between items-start">
        <div className="flex gap-4 items-start">
          <div className="app__brand-mark" aria-hidden="true">CS</div>
          <div>
            <h1 className="app__title t-page-title">Issue completion workspace</h1>
            <p className="t-body">Track every step from bug report to verified resolution, with human or Claude-assisted comments.</p>
          </div>
        </div>
        <RepoCredentialManager />
      </header>

      <nav className="app__mode-tabs" aria-label="Issue setup">
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
      </nav>

      {mode === "load" && (
        <>
          <Card className="app__intake-card">
            <span className="t-overline app__eyebrow">Continue Tracking</span>
            <h2 className="t-page-title">Load an existing GitHub Issue</h2>
            <p className="t-body">Paste the issue URL to rebuild its lifecycle from GitHub activity.</p>
            <IssueUrlForm onSubmit={handleSubmit} submitting={parsing} />
          </Card>
          {parseError && <StatusBanner error={parseError} />}
          {!target && !parseError && (
            <div className="app__empty-state">
              <div><strong>1</strong><span>Create or load an issue</span></div>
              <div><strong>2</strong><span>Comment manually or ask Claude at every stage</span></div>
              <div><strong>3</strong><span>Verify, merge, and close with a complete timeline</span></div>
            </div>
          )}
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

      {mode === "load" && target && (
        <main>
          <IssueDetailPage
            owner={target.owner}
            repository={target.repository}
            issueNumber={target.issueNumber}
          />
        </main>
      )}
    </div>
  );
}

export default App;
