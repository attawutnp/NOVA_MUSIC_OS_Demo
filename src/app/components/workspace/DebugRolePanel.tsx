import { DEBUG_ROLE_OPTIONS, getRoleCapabilities } from "../../utils/rolePermissions";
import { ShieldIcon } from "./WorkspaceIcons";

export default function DebugRolePanel({ role, onRoleChange }) {
  const capabilities = getRoleCapabilities(role);

  return (
    <aside className="debug-panel" aria-label="Debug role panel">
      <div className="debug-panel__head">
        <span className="debug-panel__icon"><ShieldIcon /></span>
        <div>
          <div className="debug-panel__eyebrow">DEBUG</div>
          <div className="debug-panel__title">Role Simulator</div>
        </div>
      </div>

      <label className="debug-panel__label" htmlFor="debug-role-select">Current role</label>
      <select id="debug-role-select" className="debug-panel__select" value={role} onChange={(event) => onRoleChange(event.target.value)}>
        {DEBUG_ROLE_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      <div className="debug-panel__caps">
        {capabilities.map((capability) => (
          <span key={capability.key} className={`debug-capability ${capability.enabled ? "is-enabled" : "is-disabled"}`}>
            {capability.label}
          </span>
        ))}
      </div>
    </aside>
  );
}
