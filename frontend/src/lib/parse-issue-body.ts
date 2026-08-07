export interface IssueBodySections {
  environment: string | null;
  stepsToReproduce: string | null;
  expectedResult: string | null;
  actualResult: string | null;
  additionalNotes: string | null;
  /** Everything before the first heading, for bodies that do not follow the template. */
  preamble: string | null;
}

const SECTION_KEYS: Record<string, keyof IssueBodySections> = {
  environment: "environment",
  "steps to reproduce": "stepsToReproduce",
  "expected result": "expectedResult",
  "actual result": "actualResult",
  "additional notes": "additionalNotes",
};

const HEADING_PATTERN = /^#{1,6}\s+(.*)$/;

/**
 * Splits a bug-report body into the sections written by the issue template so the
 * QA report can show them separately instead of dumping raw markdown.
 */
export function parseIssueBody(body: string): IssueBodySections {
  const sections: IssueBodySections = {
    environment: null,
    stepsToReproduce: null,
    expectedResult: null,
    actualResult: null,
    additionalNotes: null,
    preamble: null,
  };

  let current: keyof IssueBodySections | null = "preamble";
  const buffers = new Map<keyof IssueBodySections, string[]>();

  for (const line of body.split("\n")) {
    const heading = HEADING_PATTERN.exec(line.trim());
    if (heading) {
      current = SECTION_KEYS[heading[1].trim().toLowerCase()] ?? null;
      continue;
    }
    if (!current) continue;
    const buffer = buffers.get(current) ?? [];
    buffer.push(line);
    buffers.set(current, buffer);
  }

  for (const [key, lines] of buffers) {
    const text = lines.join("\n").trim();
    if (text) sections[key] = text;
  }

  return sections;
}

/** Short one-line summary for the issue header. */
export function issueSummary(body: string): string | null {
  const sections = parseIssueBody(body);
  const source = sections.actualResult ?? sections.preamble ?? body.trim();
  const firstParagraph = source.split(/\n\s*\n/)[0]?.trim();
  return firstParagraph || null;
}

/** Splits a reproduction-steps block into individual steps, dropping list markers. */
export function splitSteps(steps: string): string[] {
  return steps
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}
