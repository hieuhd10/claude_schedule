import { useEffect, useState } from "react";
import { getMultiRepoConfig, validateRepoToken } from "../api/client";
import type { MultiRepoConfigResponse } from "../api/types";
import { Button } from "../design-system/lift-tailux";

export function RepoCredentialManager() {
  const [config, setConfig] = useState<MultiRepoConfigResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [testTokenInput, setTestTokenInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    getMultiRepoConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  const handleValidateToken = async () => {
    if (!testTokenInput.trim()) return;
    setValidating(true);
    setValidationResult(null);
    try {
      const result = await validateRepoToken(testTokenInput.trim());
      setValidationResult(result);
    } catch {
      setValidationResult({
        valid: false,
        message: "Failed to connect to API validation server",
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="repo-credential-manager">
      <button
        type="button"
        className="badge-pill bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 text-xs rounded-full cursor-pointer hover:bg-slate-700 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        title="View Repository Credentials & Multi-Repo Status"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>
          {config?.restrict_to_configured_repository
            ? `Single Repo Mode (${config.default_owner}/${config.default_repository})`
            : "Multi-Repo Mode Active"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-xl text-sm max-w-md text-slate-300 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-slate-100">Multi-Repo Configuration</h4>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <p>
              <strong className="text-slate-200">Default Target:</strong>{" "}
              {config?.default_owner}/{config?.default_repository}
            </p>
            <p>
              <strong className="text-slate-200">Access Mode:</strong>{" "}
              {config?.restrict_to_configured_repository
                ? "Restricted to configured repository"
                : "Allows tracking any GitHub repository"}
            </p>
          </div>

          {config && config.configured_repositories.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">Mapped Repo Credentials:</p>
              <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                {config.configured_repositories.map((repo) => (
                  <li
                    key={repo.repository_full_name}
                    className="flex justify-between items-center bg-slate-800/50 px-2 py-1 rounded"
                  >
                    <span>{repo.repository_full_name}</span>
                    <span className="text-[10px] text-emerald-400">
                      {repo.has_custom_token ? "Custom Token" : "Default Token"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-200">Validate Personal Access Token:</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                className="form-input-base form-input flex-1 text-xs py-1 px-2"
                value={testTokenInput}
                onChange={(e) => setTestTokenInput(e.target.value)}
              />
              <Button
                type="button"
                color="secondary"
                disabled={validating || !testTokenInput.trim()}
                onClick={handleValidateToken}
              >
                {validating ? "Checking..." : "Verify"}
              </Button>
            </div>
            {validationResult && (
              <p
                className={`text-xs p-2 rounded ${
                  validationResult.valid
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/50"
                    : "bg-rose-950/40 text-rose-300 border border-rose-800/50"
                }`}
              >
                {validationResult.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
