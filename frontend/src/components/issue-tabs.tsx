export type IssueTab = "overview" | "qa-report";

const TABS: { id: IssueTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "qa-report", label: "QA Report" },
];

interface IssueTabsProps {
  active: IssueTab;
  onChange: (tab: IssueTab) => void;
  updatedLabel: string;
}

export function IssueTabs({ active, onChange, updatedLabel }: IssueTabsProps) {
  return (
    <div className="issue-tabs">
      <div className="issue-tabs__list" role="tablist" aria-label="Issue sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`issue-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`issue-panel-${tab.id}`}
            className={active === tab.id ? "active" : ""}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <span className="issue-tabs__updated">{updatedLabel}</span>
    </div>
  );
}
