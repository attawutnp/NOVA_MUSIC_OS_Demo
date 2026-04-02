import { useState } from "react";
import { CheckIcon, ClockIcon, CopyIcon, DotIcon } from "./WorkspaceIcons";
import { joinClasses } from "../../utils/workspace";

export function SettingTextRow({ label, value, mono = false, copyable = false, required = false }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="settings-row">
      <div className="settings-row__label">{label}{required ? <em>*</em> : null}</div>
      <div className="settings-row__control">
        <div className="settings-input settings-input--filled settings-input--compound">
          <span className={joinClasses("settings-input__value", mono && "settings-input__value--mono")}>{value}</span>
          {copyable ? (
            <button
              className={joinClasses("settings-copy", copied && "is-copied")}
              type="button"
              data-settings-copy={value}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(value);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 900);
                } catch {
                }
              }}
            >
              <CopyIcon />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SettingInputRow({ label, value, placeholder = "", type = "text", empty = false, required = false, disabled = false }) {
  return (
    <div className="settings-row">
      <div className="settings-row__label">{label}{required ? <em>*</em> : null}</div>
      <div className="settings-row__control">
        <label className={joinClasses("settings-input", "settings-input--filled", empty && "settings-input--empty", disabled && "settings-input--disabled")}>
          <input className="settings-input__control" type={type} defaultValue={value} placeholder={placeholder} disabled={disabled} />
        </label>
      </div>
    </div>
  );
}

export function DetailField({ label, value, mono = false }) {
  return (
    <div className="pd-field">
      <div className="pd-field__label">{label}</div>
      <div className={joinClasses("pd-field__value", mono && "pd-field__value--mono")}>{value}</div>
    </div>
  );
}

export function ApprovalCard({ title, status, statusClass, checks, pending = false, waiting = false }) {
  return (
    <div className="pd-approval">
      <div className="pd-approval__head">
        <div className="pd-approval__title">{title}</div>
        <span className={joinClasses("ss", statusClass !== "waiting" && `ss--${statusClass}`)} style={statusClass === "waiting" ? { background: "#f3f4f6", color: "#9d9fa3" } : undefined}>{status}</span>
      </div>
      <div className="pd-approval__checks">
        {checks.map((check) => (
          <div key={check} className="pd-approval__check">
            <span className={joinClasses("check-icon", pending ? "check-icon--pending" : waiting ? "check-icon--waiting" : "check-icon--done")}>
              {pending ? <DotIcon /> : waiting ? <ClockIcon /> : <CheckIcon />}
            </span>
            {check}
          </div>
        ))}
      </div>
    </div>
  );
}
