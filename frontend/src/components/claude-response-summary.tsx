import type { ParsedClaudeResponse } from "../api/types";
import { Badge, type DsColor } from "../design-system/lift-tailux";
import { claudeResponseStatus, type ClaudeResponseStatus } from "../lib/claude-response-status";

const CLAUDE_RESPONSE_LABEL: Record<ClaudeResponseStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  responded: "Responded",
};

const CLAUDE_RESPONSE_COLOR: Record<ClaudeResponseStatus, DsColor> = {
  passed: "success",
  failed: "error",
  responded: "neutral",
};

interface ClaudeResponseSummaryProps {
  response: ParsedClaudeResponse | null;
}

export function ClaudeResponseSummary({ response }: ClaudeResponseSummaryProps) {
  if (!response) {
    return <p className="t-caption">No Claude response recorded yet.</p>;
  }

  const status = claudeResponseStatus(response.raw_body);
  const hasParsedDetails = Boolean(response.root_cause || response.findings.length > 0);

  return (
    <div className="claude-response">
      <Badge component="span" variant="soft" color={CLAUDE_RESPONSE_COLOR[status]}>
        {CLAUDE_RESPONSE_LABEL[status]}
      </Badge>
      {/*
        Responses can be very long, so they stay collapsed. When nothing could be
        parsed out of the reply the raw comment is offered instead, otherwise the
        panel would look empty even though Claude did answer.
      */}
      <details className="claude-response__details">
        <summary>{hasParsedDetails ? "View response details" : "View raw response"}</summary>
        <div className="claude-response__body">
          {hasParsedDetails ? (
            <>
              {response.root_cause && (
                <p>
                  <strong>Root cause:</strong> {response.root_cause}
                </p>
              )}
              {response.findings.length > 0 && (
                <ul>
                  {response.findings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <pre className="claude-response__raw">{response.raw_body}</pre>
          )}
          {response.html_url && (
            <a href={response.html_url} target="_blank" rel="noreferrer">
              View on GitHub ↗
            </a>
          )}
        </div>
      </details>
    </div>
  );
}
