export interface ParsedLabelMetadata {
  environment: string | null;
  baseBranch: string | null;
  severity: string | null;
  status: string | null;
  otherLabels: string[];
}

export function parseLabelMetadata(labels: string[]): ParsedLabelMetadata {
  let environment: string | null = null;
  let baseBranch: string | null = null;
  let severity: string | null = null;
  let status: string | null = null;
  const otherLabels: string[] = [];

  for (const label of labels) {
    const [prefix, ...rest] = label.split(":");
    const value = rest.join(":");
    if (prefix === "env" && value) {
      environment = value;
    } else if (prefix === "base" && value) {
      baseBranch = value;
    } else if (prefix === "severity" && value) {
      severity = value;
    } else if (prefix === "status" && value) {
      status = value;
    } else {
      otherLabels.push(label);
    }
  }

  return { environment, baseBranch, severity, status, otherLabels };
}
