import { useState } from "react";

interface IssueUrlFormProps {
  onSubmit: (url: string) => void;
  submitting: boolean;
}

export function IssueUrlForm({ onSubmit, submitting }: IssueUrlFormProps) {
  const [url, setUrl] = useState("");

  return (
    <form
      className="issue-url-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (url.trim()) onSubmit(url.trim());
      }}
    >
      <input
        type="url"
        placeholder="https://github.com/owner/repo/issues/123"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Loading…" : "Load Issue"}
      </button>
    </form>
  );
}
