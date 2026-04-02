import { ActivityIcon, LayersIcon, ProjectFolderIcon, SearchIcon } from "./WorkspaceIcons";
import {
  formatCurrency,
  handleRowEnter,
  joinClasses,
  renderWorkflowDots,
} from "../../utils/workspace";
import { getProjectListAccess } from "../../utils/rolePermissions";

export default function ProjectsSection({
  isVisible,
  projectSearch,
  setProjectSearch,
  stageFilter,
  setStageFilter,
  statusFilter,
  setStatusFilter,
  stageOptions,
  statusOptions,
  visibleProjects,
  onProjectOpen,
  onCreateProject,
  role,
  permissions,
}: any) {
  const access = getProjectListAccess(role, permissions);

  return (
    <section className="projects-page" data-page-content="projects" aria-hidden={!isVisible}>
      <div className="projects-access-note">
        <span className={joinClasses("project-access", access.mode === "Can manage" && "is-manage", access.mode === "Contribute" && "is-contribute", access.mode === "Read only" && "is-readonly")}>{access.mode}</span>
        <span>{access.note}</span>
      </div>

      <div className="filter-bar">
        <label className="filter-field filter-field--search">
          <span className="filter-field__icon" aria-hidden="true"><SearchIcon /></span>
          <input className="filter-input filter-input--icon" id="project-search" type="text" placeholder="ค้นหาโปรเจกต์…" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} />
        </label>
        <label className="filter-field">
          <span className="filter-field__icon" aria-hidden="true"><LayersIcon /></span>
          <select className="filter-select filter-select--icon" id="stage-filter" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
            {stageOptions.map((option: any) => (
              <option key={option.value || "all"} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span className="filter-field__icon" aria-hidden="true"><ActivityIcon /></span>
          <select className="filter-select filter-select--icon" id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusOptions.map((option: any) => (
              <option key={option.value || "all"} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button className="settings-primary" type="button" onClick={onCreateProject} style={{ marginLeft: "auto" }}><span>+ สร้างโปรเจกต์</span></button>
      </div>

      <div className="panel-card">
        <table className="mini-table" id="projects-table">
          <thead>
            <tr>
              <th>โปรเจกต์</th>
              <th>ขั้นตอน</th>
              <th>สถานะ</th>
              <th>สตรีม</th>
              <th>รายได้</th>
              <th>สร้างวันที่</th>
            </tr>
          </thead>
          <tbody>
            {visibleProjects.map((project: any) => (
              <tr key={project.id} onClick={() => onProjectOpen(project.id)} onKeyDown={(event) => handleRowEnter(event, () => onProjectOpen(project.id))} tabIndex={0} style={{ cursor: "pointer" }}>
                <td>
                  <div className="project-cell">
                    <span className="project-cell__icon" aria-hidden="true"><ProjectFolderIcon /></span>
                    <div className="project-cell__copy">
                      <div style={{ fontWeight: 400, color: "#232730" }}>{project.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 1, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "#8a8c91" }}>{project.artist} · {project.genre}</span>
                        <span className={joinClasses("project-access", access.mode === "Can manage" && "is-manage", access.mode === "Contribute" && "is-contribute", access.mode === "Read only" && "is-readonly")}>{access.mode}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={joinClasses("sb", `sb--${project.stageClass}`)}>{project.stageLabel}</span>
                  {renderWorkflowDots(project.detailStep)}
                </td>
                <td>
                  <span className={joinClasses("ss", `ss--${project.statusClass}`)}>{project.statusLabel}</span>
                </td>
                <td className="mono">{project.streamsLabel}</td>
                <td style={{ fontWeight: 400, color: permissions.viewRevenue ? "#232730" : "#8a8c91" }} title={permissions.viewRevenue ? undefined : "Requires Admin or Producer access to revenue."}>
                  {permissions.viewRevenue ? formatCurrency(project.revenue) : "Restricted"}
                </td>
                <td>{project.createdLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
