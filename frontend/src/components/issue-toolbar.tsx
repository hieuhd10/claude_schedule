import { useEffect, useState } from "react";

import type { Issue } from "../api/types";
import { Button } from "../design-system/lift-tailux";

interface IssueToolbarProps {
  owner: string;
  repository: string;
  issue: Issue;
  onRefresh: () => void;
  refreshing: boolean;
}

export function IssueToolbar({ owner, repository, issue, onRefresh, refreshing }: IssueToolbarProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(issue.html_url);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the GitHub link stays available next to this button.
    }
  }

  return (
    <div className="issue-toolbar">
      <nav className="issue-toolbar__breadcrumb" aria-label="Issue location">
        <span>{owner}</span>
        <span aria-hidden="true">/</span>
        <span>{repository}</span>
        <span aria-hidden="true">/</span>
        <strong>#{issue.number}</strong>
      </nav>

      <div className="issue-toolbar__actions">
        <Button variant="flat" onClick={copyLink}>
          {copied ? "Link Copied" : "Copy Link"}
        </Button>
        <Button component="a" variant="outlined" href={issue.html_url} target="_blank" rel="noreferrer">
          View On GitHub
        </Button>
        <Button color="primary" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh From GitHub"}
        </Button>
      </div>
    </div>
  );
}
