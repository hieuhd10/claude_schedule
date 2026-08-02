import { useEffect, useState } from "react";

import { createIssue, getConfig } from "../api/client";
import type { Issue } from "../api/types";

interface IssueCreateFormProps {
  onCreated: (owner: string, repository: string, issue: Issue) => void;
}

const SEVERITIES = ["critical", "high", "medium", "low"];

export function IssueCreateForm({ onCreated }: IssueCreateFormProps) {
  const [owner, setOwner] = useState("");
  const [repository, setRepository] = useState("");
  const [title, setTitle] = useState("");
  const [environment, setEnvironment] = useState("");
  const [baseBranch, setBaseBranch] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [assignee, setAssignee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdIssue, setCreatedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    void getConfig()
      .then((config) => {
        setOwner(config.owner);
        setRepository(config.repository);
      })
      .catch(() => {
        // Config is only a convenience prefill; leave fields blank for manual entry on failure.
      });
  }, []);

  const canSubmit =
    owner.trim() &&
    repository.trim() &&
    title.trim() &&
    stepsToReproduce.trim() &&
    expectedResult.trim() &&
    actualResult.trim();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await createIssue(owner.trim(), repository.trim(), {
        title: title.trim(),
        environment: environment.trim() || null,
        base_branch: baseBranch.trim() || null,
        severity: severity || null,
        steps_to_reproduce: stepsToReproduce.trim(),
        expected_result: expectedResult.trim(),
        actual_result: actualResult.trim(),
        additional_notes: additionalNotes.trim() || null,
        assignee: assignee.trim() || null,
      });
      setCreatedIssue(response.issue);
      onCreated(owner.trim(), repository.trim(), response.issue);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="issue-create-form" onSubmit={handleSubmit}>
      <h2>Report a New Issue (QA)</h2>
      <p className="issue-create-form__hint">
        Fills out a real GitHub Issue with the information a DEV needs to confirm and start
        resolving the bug.
      </p>

      <div className="issue-create-form__row">
        <label>
          Owner *
          <input value={owner} onChange={(e) => setOwner(e.target.value)} required />
        </label>
        <label>
          Repository *
          <input value={repository} onChange={(e) => setRepository(e.target.value)} required />
        </label>
      </div>

      <label>
        Title *
        <input value={title} maxLength={256} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <div className="issue-create-form__row">
        <label>
          Environment
          <input
            placeholder="dev / staging / prod"
            maxLength={46}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          />
        </label>
        <label>
          Base branch
          <input
            placeholder="develop"
            maxLength={45}
            value={baseBranch}
            onChange={(e) => setBaseBranch(e.target.value)}
          />
        </label>
        <label>
          Severity
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {SEVERITIES.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Steps to Reproduce *
        <textarea
          rows={4}
          placeholder={"1. ...\n2. ...\n3. ..."}
          value={stepsToReproduce}
          onChange={(e) => setStepsToReproduce(e.target.value)}
          required
        />
      </label>

      <label>
        Expected Result *
        <textarea
          rows={2}
          value={expectedResult}
          onChange={(e) => setExpectedResult(e.target.value)}
          required
        />
      </label>

      <label>
        Actual Result *
        <textarea
          rows={2}
          value={actualResult}
          onChange={(e) => setActualResult(e.target.value)}
          required
        />
      </label>

      <label>
        Additional Notes
        <textarea
          rows={2}
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
        />
      </label>

      <label>
        Assignee (GitHub username, optional)
        <input value={assignee} onChange={(e) => setAssignee(e.target.value)} />
      </label>

      <button type="submit" disabled={!canSubmit || submitting}>
        {submitting ? "Creating…" : "Create GitHub Issue"}
      </button>

      {error && <div className="status-banner status-banner--error">{error.message}</div>}
      {createdIssue && (
        <div className="command-composer__success">
          Issue created:{" "}
          <a href={createdIssue.html_url} target="_blank" rel="noreferrer">
            #{createdIssue.number} {createdIssue.title}
          </a>
        </div>
      )}
    </form>
  );
}
