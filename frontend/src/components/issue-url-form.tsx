import { useState } from "react";

import { Button } from "../design-system/lift-tailux";

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
        className="form-input-base form-input"
        type="url"
        placeholder="https://github.com/owner/repo/issues/123"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        required
      />
      <Button type="submit" color="primary" disabled={submitting}>
        {submitting ? "Loading…" : "Load Issue"}
      </Button>
    </form>
  );
}
