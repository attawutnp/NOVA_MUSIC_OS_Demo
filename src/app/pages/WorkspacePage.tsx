import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PageTitleWithIcon } from "../components/workspace/PageHeading";
import ProjectDetail from "../components/workspace/ProjectDetail";
import ProjectsSection from "../components/workspace/ProjectsSection";
import {
  ProjectFolderIcon,
  ActivityIcon,
  BookIcon,
  CatalogIcon,
  ChevronIcon,
  CloudIcon,
  DocIcon,
  GridIcon,
  HelpIcon,
  HomeIcon,
  LayersIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  ProjectsIcon,
  TrendIcon,
  UserIcon,
} from "../components/workspace/WorkspaceIcons";
import DebugRolePanel from "../components/workspace/DebugRolePanel";
import {
  ApprovalLaneChart,
  DashboardTrendChart,
  DistributorMixChart,
  ReleaseTrendChart,
} from "../components/workspace/WorkspaceCharts";
import {
  SettingInputRow,
  SettingTextRow,
} from "../components/workspace/WorkspaceFields";
import {
  DASHBOARD_METRICS,
  GENERIC_PAGES,
  ORGANIZATIONS,
  PENDING_INVITES,
  PROJECTS,
  ROLE_LIBRARY,
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  TEAM_MEMBERS,
  TOP_PERFORMERS,
} from "../services/workspaceData";
import {
  formatCurrency,
  handleRowEnter,
  isActiveView,
  joinClasses,
  resolveStageClass,
  updateInviteRow,
} from "../utils/workspace";
import {
  canAccessView,
  filterNavigationByRole,
  getPageAccess,
  getRolePermissions,
} from "../utils/rolePermissions";

const NAVIGATION = [
  { type: "link", key: "dashboard", label: "หน้าหลัก", icon: HomeIcon, delay: 60, view: { navId: "dashboard", page: "dashboard", title: "หน้าหลัก" } },
  {
    type: "group",
    key: "studio",
    label: "Studio",
    icon: LayersIcon,
    delay: 90,
    children: [
      { key: "admin-panel", label: "ตั้งค่า", view: { navId: "admin-panel", page: "admin", title: "ตั้งค่า" } },
      { key: "team", label: "ทีมงาน", view: { navId: "team", page: "team", title: "ทีมงาน" } },
      { key: "roles", label: "บทบาท", view: { navId: "roles", page: "roles", title: "บทบาท" } },
    ],
  },
  { type: "link", key: "profile", label: "โปรไฟล์", icon: UserIcon, delay: 120, view: { navId: "profile", page: "profile", title: "โปรไฟล์" } },
  {
    type: "group",
    key: "projects",
    label: "โปรเจกต์",
    icon: ProjectFolderIcon,
    delay: 150,
    children: [
      { key: "all-projects", label: "ทั้งหมด", view: { navId: "all-projects", page: "projects", title: "โปรเจกต์ทั้งหมด", projectScope: "all" } },
      { key: "active-projects", label: "กำลังทำ", view: { navId: "active-projects", page: "projects", title: "โปรเจกต์ที่กำลังทำ", projectScope: "active" } },
      { key: "completed-projects", label: "เสร็จแล้ว", view: { navId: "completed-projects", page: "projects", title: "โปรเจกต์ที่เสร็จแล้ว", projectScope: "completed" } },
    ],
  },
  {
    type: "group",
    key: "release",
    label: "รายได้",
    icon: TrendIcon,
    delay: 180,
    children: [
      { key: "release-overview", label: "ภาพรวม", view: { navId: "release-overview", page: "release", title: "ภาพรวม", releaseScope: "overview" } },
      { key: "release-distributors", label: "ตามแพลตฟอร์ม", view: { navId: "release-distributors", page: "release", title: "ตามแพลตฟอร์ม", releaseScope: "distributors" } },
      { key: "release-final-sign", label: "ตามศิลปิน", view: { navId: "release-final-sign", page: "release", title: "ตามศิลปิน", releaseScope: "final-sign" } },
    ],
  },
  { type: "link", key: "catalog", label: "AI Production", icon: CatalogIcon, delay: 210, view: { navId: "catalog", page: "generic", title: "AI Production", genericKey: "ai-production" } },
  {
    type: "group",
    key: "organizations",
    label: "ศิลปิน",
    icon: GridIcon,
    delay: 240,
    children: [
      { key: "organizations-roster", label: "รายชื่อ", view: { navId: "organizations-roster", page: "organizations", title: "รายชื่อศิลปิน", orgScope: "studios" } },
      { key: "organizations-integrations", label: "ผู้ร่วมงาน", view: { navId: "organizations-integrations", page: "organizations", title: "ผู้ร่วมงาน", orgScope: "integrations" } },
    ],
  },
  {
    type: "group",
    key: "contracts",
    label: "สัญญา",
    icon: DocIcon,
    delay: 270,
    children: [
      { key: "agreements", label: "ข้อตกลง", view: { navId: "agreements", page: "generic", title: "ข้อตกลง", genericKey: "contracts" } },
      { key: "royalties", label: "แบ่งค่าลิขสิทธิ์", view: { navId: "royalties", page: "generic", title: "แบ่งค่าลิขสิทธิ์", genericKey: "contracts" } },
    ],
  },
  {
    type: "group",
    key: "activity",
    label: "กิจกรรม",
    icon: ActivityIcon,
    delay: 300,
    children: [
      { key: "activity-feed", label: "ฟีด", view: { navId: "activity-feed", page: "generic", title: "ฟีดกิจกรรม", genericKey: "activity" } },
      { key: "activity-history", label: "ประวัติ", view: { navId: "activity-history", page: "generic", title: "ประวัติกิจกรรม", genericKey: "activity" } },
    ],
  },
];

const UTILITY_LINKS = [
  { key: "help", label: "Help", icon: HelpIcon, delay: 330, view: { navId: "help", page: "generic", title: "Help", genericKey: "help" } },
  { key: "docs", label: "Docs", icon: BookIcon, delay: 360, view: { navId: "docs", page: "generic", title: "Docs", genericKey: "docs" } },
];

const INITIAL_VIEW = { navId: "dashboard", page: "dashboard", title: "หน้าหลัก" };

function WorkspacePage() {
  const [ready, setReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    studio: false,
    projects: false,
    release: false,
    organizations: false,
    contracts: false,
    activity: false,
  });
  const [view, setView] = useState<any>(INITIAL_VIEW);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [selectedStep, setSelectedStep] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRows, setInviteRows] = useState([{ role: "Admin", email: "" }]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createFormData, setCreateFormData] = useState({ projectName: "", concept: "", songCount: "1" });
  const [projectGoals, setProjectGoals] = useState<string[]>([]);
  const [projectGenres, setProjectGenres] = useState<string[]>([]);
  const [debugRole, setDebugRole] = useState("Admin");
  const [projectSearch, setProjectSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const deferredProjectSearch = useDeferredValue(projectSearch.trim().toLowerCase());
  const activeProject = useMemo(
    () => PROJECTS.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", mobileMenuOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (activeProject) {
      setSelectedStep(activeProject.detailStep);
    }
  }, [activeProject]);

  const visibleProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      if (view.projectScope === "active" && project.statusClass === "live") {
        return false;
      }
      if (view.projectScope === "completed" && project.statusClass !== "live") {
        return false;
      }
      if (stageFilter && project.stageClass !== stageFilter) {
        return false;
      }
      if (statusFilter && project.statusClass !== statusFilter) {
        return false;
      }

      if (!deferredProjectSearch) {
        return true;
      }

      const haystack = [
        project.title,
        project.artist,
        project.genre,
        project.organization,
        project.projectId,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredProjectSearch);
    });
  }, [deferredProjectSearch, stageFilter, statusFilter, view.projectScope]);

  const dashboardProjects = useMemo(() => PROJECTS.slice(0, 5), []);
  const rolePermissions = useMemo(() => getRolePermissions(debugRole), [debugRole]);
  const visibleNavigation = useMemo(() => filterNavigationByRole(NAVIGATION, rolePermissions), [rolePermissions]);
  const settingsAccess = useMemo(() => getPageAccess("settings", debugRole, rolePermissions), [debugRole, rolePermissions]);
  const teamAccess = useMemo(() => getPageAccess("team", debugRole, rolePermissions), [debugRole, rolePermissions]);
  const rolesAccess = useMemo(() => getPageAccess("roles", debugRole, rolePermissions), [debugRole, rolePermissions]);
  const revenueAccess = useMemo(() => getPageAccess("revenue", debugRole, rolePermissions), [debugRole, rolePermissions]);
  const profileAccess = useMemo(() => getPageAccess("profile", debugRole, rolePermissions), [debugRole, rolePermissions]);
  const stageClassName = activeProject ? "is-project-detail" : resolveStageClass(view.page);
  const shellClassName = joinClasses("app-shell", ready && "is-ready");
  const pageTitleIcon = activeProject || view.page === "projects" ? <ProjectsIcon /> : null;
  const canViewRevenue = rolePermissions.viewRevenue;

  const handleNavigate = (nextView: any) => {
    setMobileMenuOpen(false);
    startTransition(() => {
      setActiveProjectId(null);
      setView(nextView);
    });
  };

  const handleProjectOpen = (projectId: any) => {
    setMobileMenuOpen(false);
    startTransition(() => {
      setView({ navId: "all-projects", page: "projects", title: "โปรเจกต์ทั้งหมด", projectScope: "all" });
      setActiveProjectId(projectId);
    });
  };

  const handleProjectBack = () => {
    startTransition(() => {
      setActiveProjectId(null);
      setView({ navId: "all-projects", page: "projects", title: "โปรเจกต์ทั้งหมด", projectScope: "all" });
    });
  };

  const handleCreateProject = () => {
    if (createStep === 1 && createFormData.projectName.trim()) {
      setCreateStep(2);
    } else if (createStep === 2) {
      setShowCreateModal(false);
      setCreateStep(1);
      setCreateFormData({ projectName: "", concept: "", songCount: "1" });
      setProjectGoals([]);
      setProjectGenres([]);
    }
  };

  const toggleProjectGoal = (goal: string) => {
    setProjectGoals((current) =>
      current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal]
    );
  };

  const toggleProjectGenre = (genre: string) => {
    setProjectGenres((current) =>
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre]
    );
  };

  useEffect(() => {
    if (!canAccessView(view, rolePermissions)) {
      setActiveProjectId(null);
      setView(INITIAL_VIEW);
    }
  }, [rolePermissions, view]);

  return (
    <div className={shellClassName}>
      <div className="brandbar">
        <button className="wordmark wordmark--nova" type="button" onClick={() => handleNavigate(INITIAL_VIEW)} aria-label="Nova Music OS home">
          <span style={{ fontSize: 20, fontWeight: 700, color: "#7c3aed" }}>Nova</span>
        </button>
      </div>

      <header className="topbar">
        <button className="mobile-menu" type="button" aria-label="Open navigation" data-menu-toggle onClick={() => setMobileMenuOpen((current) => !current)}>
          <MenuIcon />
        </button>

        <div className="topbar-actions">
          <button className="topbar-link" type="button" onClick={() => handleNavigate({ navId: "activity-feed", page: "generic", title: "ฟีดกิจกรรม", genericKey: "activity" })}>
            <span className="topbar-icon"><ActivityIcon /></span>
            <span>กิจกรรม</span>
          </button>

          {rolePermissions.viewRevenue || rolePermissions.releaseProject ? (
            <button className="environment-pill" type="button" onClick={() => handleNavigate({ navId: "release-overview", page: "release", title: "ภาพรวม", releaseScope: "overview" })}>
              <span className="topbar-icon topbar-icon--warm"><CloudIcon /></span>
              <span>โปรดักชั่น</span>
              <span className="nav-chevron"><ChevronIcon /></span>
            </button>
          ) : null}

          <button className="avatar-button" type="button" aria-label="Open profile" onClick={() => handleNavigate({ navId: "profile", page: "profile", title: "โปรไฟล์" })}>
            AT
          </button>
        </div>
      </header>

      <aside className="sidebar" aria-label="Primary navigation">
        <button className="workspace-button" type="button" onClick={() => handleNavigate({ navId: "admin-panel", page: "admin", title: "ตั้งค่า" })}>
          <span>Nova Music Studio</span>
          <ChevronIcon />
        </button>

        <div className="sidebar-scroll">
          <nav className="sidebar-nav">
            <div className="nav-section">
              {visibleNavigation.slice(0, 3).map((item: any) =>
                renderNavigationItem({ item, openGroups, setOpenGroups, view, onNavigate: handleNavigate }),
              )}
            </div>

            <div className="nav-divider" aria-hidden="true" />

            <div className="nav-section">
              {visibleNavigation.slice(3, 6).map((item: any) =>
                renderNavigationItem({ item, openGroups, setOpenGroups, view, onNavigate: handleNavigate }),
              )}
            </div>

            <div className="nav-divider" aria-hidden="true" />

            <div className="nav-section">
              {visibleNavigation.slice(6).map((item: any) =>
                renderNavigationItem({ item, openGroups, setOpenGroups, view, onNavigate: handleNavigate }),
              )}
            </div>
          </nav>
        </div>

        <div className="utility-links">
          {UTILITY_LINKS.map((item) => (
            <button
              key={item.key}
              className={joinClasses("nav-link", "nav-link--utility", isActiveView(view, item.view) && "active")}
              type="button"
              data-nav-link
              style={{ "--delay": `${item.delay}ms` } as any}
              onClick={() => handleNavigate(item.view)}
            >
              <span className="nav-link__main">
                <span className="nav-icon"><item.icon /></span>
                <span>{item.label}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className={joinClasses("stage", stageClassName)} id="home">
        <div className="stage-head">
          <PageTitleWithIcon icon={pageTitleIcon} title={activeProject ? activeProject.title : view.title} />
        </div>

        <div className="stage-loader" aria-hidden="true">
          <span className="stage-loader__spinner" />
        </div>

        <div className="stage-sections" data-page-content="home">
          <div className="stats-row">
            {DASHBOARD_METRICS.map((metric, index) => (
              <div key={metric.label} className="stat-card">
                <div className="stat-card__label">{metric.label}</div>
                <div className="stat-card__value" style={index === 0 && !canViewRevenue ? { color: "#8a8c91" } : metric.valueStyle}>{index === 0 && !canViewRevenue ? "Restricted" : metric.value}</div>
                {metric.trend ? <div className={joinClasses("stat-card__trend", metric.trendClass)}>{index === 0 && !canViewRevenue ? "Requires Admin or Producer access" : metric.trend}</div> : null}
                {metric.sub ? <div className="stat-card__sub">{metric.sub}</div> : null}
              </div>
            ))}
          </div>

          <div className="chart-panel">
            <div className="chart-panel__head">
              <div className="chart-panel__title">รายได้รายเดือน</div>
              <select className="filter-select" defaultValue="6m" style={{ height: 28, fontSize: 12, padding: "0 8px" }}>
                <option value="6m">6 เดือนที่แล้ว</option>
                <option value="12m">12 เดือนที่แล้ว</option>
                <option value="ytd">Year to date</option>
              </select>
            </div>
            {stageClassName === "is-home" ? (canViewRevenue ? <DashboardTrendChart /> : <div className="page-access-banner is-readonly" style={{ margin: 16 }}>Revenue chart is restricted for this role.</div>) : null}
          </div>

          <div className="dash-grid">
            <div className="panel-card">
              <div className="panel-card__head">โปรเจกต์ล่าสุด</div>
              <table className="mini-table" id="dashboard-projects-table">
                <thead>
                  <tr>
                    <th>โปรเจกต์</th>
                    <th>ขั้นตอน</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardProjects.map((project) => (
                    <tr key={project.id} onClick={() => handleProjectOpen(project.id)} onKeyDown={(event) => handleRowEnter(event, () => handleProjectOpen(project.id))} tabIndex={0} style={{ cursor: "pointer" }}>
                      <td>
                        <div style={{ fontWeight: 400, color: "#232730" }}>{project.title}</div>
                        <div style={{ fontSize: 12, color: "#8a8c91", marginTop: 1 }}>{project.artist} · {project.genre}</div>
                      </td>
                      <td><span className={joinClasses("sb", `sb--${project.stageClass}`)}>{project.stageLabel}</span></td>
                      <td><span className={joinClasses("ss", `ss--${project.statusClass}`)}>{project.statusLabel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="panel-card">
              <div className="panel-card__head">เพลงยอดนิยม</div>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>เพลง</th>
                    <th>สตรีม</th>
                    <th>รายได้</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PERFORMERS.map((row) => (
                    <tr key={row.title}>
                      <td>
                        <div style={{ fontWeight: 400, color: "#232730" }}>{row.title}</div>
                        <div style={{ fontSize: 11, color: "#8a8c91" }}>{row.artist}</div>
                      </td>
                      <td className="mono">{row.streams}</td>
                      <td style={{ fontWeight: 400, color: canViewRevenue ? "#232730" : "#8a8c91" }}>{canViewRevenue ? row.revenue : "Restricted"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="chart-panel">
            <div className="chart-panel__head">
              <div className="chart-panel__title">รายได้ตามแพลตฟอร์ม</div>
            </div>
            {stageClassName === "is-home" ? (canViewRevenue ? <ApprovalLaneChart /> : <div className="page-access-banner is-readonly" style={{ margin: 16 }}>Platform revenue breakdown is restricted for this role.</div>) : null}
          </div>
        </div>

        <ProjectsSection
          isVisible={stageClassName === "is-projects"}
          projectSearch={projectSearch}
          setProjectSearch={setProjectSearch}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          stageOptions={STAGE_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          visibleProjects={visibleProjects}
          onProjectOpen={handleProjectOpen}
          onCreateProject={() => setShowCreateModal(true)}
          role={debugRole}
          permissions={rolePermissions}
        />

        <section className="revenue-page" data-page-content="revenue" aria-hidden={stageClassName !== "is-revenue"}>
          <PageAccessBanner access={revenueAccess} />
          <div className="revenue-grid">
            <div className="doughnut-wrap">
              <div className="doughnut-wrap__title">Platform Share</div>
              {stageClassName === "is-revenue" ? <DistributorMixChart /> : null}
            </div>

            <div className="panel-card">
              <div className="panel-card__head">Platform Breakdown</div>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Revenue</th>
                    <th>Share</th>
                    <th>Streams</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Spotify", "$27,412", "57.3%", "1.8M"],
                    ["Apple Music", "$9,564", "20.0%", "620K"],
                    ["YouTube Music", "$4,303", "9.0%", "890K"],
                    ["Amazon Music", "$2,391", "5.0%", "310K"],
                    ["Tidal", "$1,435", "3.0%", "95K"],
                    ["Others", "$2,715", "5.7%", "420K"],
                  ].map(([name, revenue, share, streams]) => (
                    <tr key={name}>
                      <td style={{ fontWeight: 400, color: "#232730" }}>{name}</td>
                      <td className="mono">{revenue}</td>
                      <td>{share}</td>
                      <td className="mono">{streams}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="chart-panel">
            <div className="chart-panel__head">
              <div className="chart-panel__title">Revenue Trend by Platform</div>
            </div>
            {stageClassName === "is-revenue" ? <ReleaseTrendChart /> : null}
          </div>
        </section>

        <section className="artists-page" data-page-content="artists" aria-hidden={stageClassName !== "is-artists"}>
          <div className="artists-grid">
            {ORGANIZATIONS.map((organization) => (
              <div key={organization.id} className="artist-card">
                <div className="artist-card__top">
                  <div className="artist-card__avatar" style={{ background: organization.color }}>{organization.initials}</div>
                  <div><div className="artist-card__name">{organization.name}</div><div className="artist-card__genre">{organization.summary}</div></div>
                </div>

                <div className="artist-card__stats">
                  {organization.metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="artist-card__stat-label">{metric.label}</div>
                      <div className="artist-card__stat-value" style={metric.label === "สถานะ" ? { color: "#3ba659", fontSize: 13 } : undefined}>{metric.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-page" data-page-content="settings" aria-hidden={stageClassName !== "is-settings"}>
          <PageAccessBanner access={settingsAccess} />
          <div className="settings-section">
            <div className="settings-section__head settings-section__head--stacked"><h2>ทั่วไป</h2></div>
            <div className="settings-rows">
              <SettingTextRow label="ชื่อ Studio" value="Nova Music Studio" required />
              <SettingTextRow label="ID" value="studio_3BceutZhEpZn3wHByCfs6NYEeWp" mono copyable />
              <div className="settings-row"><div className="settings-row__label">สร้างวันที่</div><div className="settings-row__control"><div className="settings-text">15 มกราคม 2025 09:00 UTC</div></div></div>
              <div className="settings-row"><div className="settings-row__label">แผน</div><div className="settings-row__control"><div className="settings-level"><div className="settings-level__badge">Professional</div></div></div></div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section__head settings-section__head--stacked">
              <h2>แบ่งค่าลิขสิทธิ์เริ่มต้น</h2>
              <p>ตั้งค่าเปอร์เซ็นต์แบ่งค่าลิขสิทธิ์เริ่มต้นสำหรับโปรเจกต์ใหม่</p>
            </div>

            <div className="settings-rows">
              <SettingInputRow label="สัดส่วน Producer" value="50%" disabled={!settingsAccess.canWrite} />
              <SettingInputRow label="สัดส่วน Artist" value="30%" disabled={!settingsAccess.canWrite} />
              <SettingInputRow label="สัดส่วน Label" value="20%" disabled={!settingsAccess.canWrite} />
            </div>
          </div>

          <div className="settings-footer">
            <button className="settings-primary settings-primary--save" type="button" style={{ opacity: settingsAccess.canWrite ? 1 : 0.45, pointerEvents: settingsAccess.canWrite ? "auto" : "none" }}><span>บันทึก</span></button>
          </div>
        </section>

        <section className="team-page" data-page-content="team" aria-hidden={stageClassName !== "is-team"}>
          <PageAccessBanner access={teamAccess} />
          <div className="team-section">
            <div className="team-section__title">สมาชิก</div>
            <div className="team-table team-table--users">
              <div className="team-table__head team-table__row team-table__row--users">
                <div>ชื่อ</div>
                <div>อีเมล</div>
                <div>2FA</div>
                <div className="team-table__role-head"><span>บทบาท</span></div>
                <div />
              </div>

              {TEAM_MEMBERS.map((member) => (
                <div key={member.email} className="team-table__row team-table__row--users">
                  <div className="team-user">
                    <div className="team-user__avatar" style={{ background: member.avatarColor, color: member.avatarTextColor ?? "#ffffff" }}>{member.initials}</div>
                    <div className="team-user__meta">
                      <div className="team-user__name">{member.name}</div>
                      <div className="team-user__flags">
                        {member.roleBadge.map((badge) => (
                          <span key={badge} className={joinClasses("team-pill", badge === "You" && "team-pill--info")}>{badge}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="team-table__text">{member.email}</div>
                  <div className="team-table__text">{member.twoFactor}</div>
                  <button className="team-role-select" type="button" style={{ opacity: teamAccess.canWrite ? 1 : 0.55, pointerEvents: teamAccess.canWrite ? "auto" : "none" }}>
                    <span>{member.role}</span>
                    <ChevronIcon />
                  </button>
                  <div className="team-actions"><button className="team-menu" type="button" title={teamAccess.canDelete ? "Manage member" : "Read-only"} style={{ opacity: teamAccess.canDelete ? 1 : 0.4, pointerEvents: teamAccess.canDelete ? "auto" : "none" }}><span /><span /><span /></button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="team-section">
            <div className="team-section__title">รอรับการเชิญ</div>
            <div className="team-table team-table--invites">
              <div className="team-table__head team-table__row team-table__row--invites">
                <div>อีเมล</div>
                <div />
                <div className="team-table__role-head"><span>บทบาท</span></div>
                <div>สร้าง</div>
                <div />
              </div>

              {PENDING_INVITES.map((invite) => (
                <div key={invite.email} className="team-table__row team-table__row--invites">
                  <div className="team-table__text">{invite.email}</div>
                  <div />
                  <div><span className="team-chip">{invite.role}</span></div>
                  <div className="team-table__text">{invite.created}</div>
                  <div className="team-actions"><button className="team-menu" type="button" title={teamAccess.canDeleteInvites ? "Manage invite" : "Read-only"} style={{ opacity: teamAccess.canDeleteInvites ? 1 : 0.4, pointerEvents: teamAccess.canDeleteInvites ? "auto" : "none" }}><span /><span /><span /></button></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="roles-page" data-page-content="roles" aria-hidden={stageClassName !== "is-roles"}>
          <PageAccessBanner access={rolesAccess} />
          <div className="roles-table">
            <div className="roles-table__row roles-table__head">
              <div>ชื่อ</div>
              <div>สมาชิก</div>
              <div />
            </div>

            {ROLE_LIBRARY.map((role) => (
              <div key={role.name} className="roles-table__row">
                <div>
                  <div className="role-name">{role.name}</div>
                  <div className="role-desc">{role.description}</div>
                </div>
                <div className="team-table__text">{role.users}</div>
                <div className="role-lock">{rolesAccess.canDelete ? <button className="ghost-button pd-inline-action" type="button">ลบ</button> : <LockIcon />}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="user-page" data-page-content="user" aria-hidden={stageClassName !== "is-user"}>
          <PageAccessBanner access={profileAccess} />
          <div className="settings-section">
            <div className="settings-section__head settings-section__head--stacked"><h2>ข้อมูลส่วนบุคคล</h2></div>
            <div className="settings-rows">
              <SettingInputRow label="ชื่อจริง" value="Anawat" required disabled={!profileAccess.canWrite} />
              <SettingInputRow label="นามสกุล" value="Tongta" required disabled={!profileAccess.canWrite} />
              <div className="settings-row">
                <div className="settings-row__label">ที่อยู่อีเมล</div>
                <div className="settings-row__control">
                  <div className="settings-input settings-input--filled settings-input--compound">
                    <span className="settings-input__value">anawattongta@gmail.com</span>
                    <span style={{ fontSize: 12, padding: "0 8px", borderRadius: 6, background: "rgba(59,166,89,0.1)", color: "#3ba659" }}>ยืนยันแล้ว ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section__head settings-section__head--stacked"><h2>รหัสผ่าน</h2></div>
            <div className="settings-rows">
              <SettingInputRow label="รหัสผ่านใหม่" value="" placeholder="รหัสผ่านใหม่" type="password" empty disabled={!profileAccess.canWrite} />
              <SettingInputRow label="รหัสผ่านปัจจุบัน" value="" placeholder="รหัสผ่านปัจจุบัน" type="password" empty disabled={!profileAccess.canWrite} />
            </div>
          </div>

          <div className="settings-footer">
            <button className="settings-primary settings-primary--save" type="button" style={{ opacity: profileAccess.canWrite ? 1 : 0.45, pointerEvents: profileAccess.canWrite ? "auto" : "none" }}><span>บันทึก</span></button>
          </div>
        </section>

        <section className="page-placeholder" data-page-content="generic" aria-hidden={stageClassName !== "is-generic"}>

        </section>

        {activeProject ? (
          <ProjectDetail role={debugRole} permissions={rolePermissions} project={activeProject} selectedStep={selectedStep} onStepChange={setSelectedStep} onBack={handleProjectBack} />
        ) : null}
      </main>

      <div className={joinClasses("modal-overlay", showInviteModal && "is-open")} id="invite-modal" role="dialog" aria-modal="true" onClick={(event) => {
        if (event.target === event.currentTarget) {
          setShowInviteModal(false);
        }
      }}>
        <div className="modal">
          <div className="modal-icon"><MailIcon /></div>
          <h2 className="modal-title">เชิญสมาชิก</h2>
          <p className="modal-sub">เลือกบทบาทสำหรับแต่ละอีเมล</p>

          <div id="modal-rows">
            {inviteRows.map((row, index) => (
              <div key={`${row.role}-${index}`} className="modal-row">
                <div style={{ position: "relative" }}>
                  <select className="modal-select" value={row.role} onChange={(event) => updateInviteRow(setInviteRows, index, "role", event.target.value)}>
                    <option>Admin</option>
                    <option>Producer</option>
                    <option>A&R</option>
                    <option>Engineer</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <input className="modal-input" type="email" placeholder="ที่อยู่อีเมล" value={row.email} onChange={(event) => updateInviteRow(setInviteRows, index, "email", event.target.value)} />
              </div>
            ))}
          </div>

          <button className="modal-add" type="button" id="modal-add-row" style={{ opacity: teamAccess.canInvite ? 1 : 0.4, pointerEvents: teamAccess.canInvite ? "auto" : "none" }} onClick={() => setInviteRows((current) => [...current, { role: "Admin", email: "" }])}>+ เพิ่มอีก</button>

          <div className="modal-footer">
            <button className="modal-cancel" type="button" id="modal-cancel" onClick={() => setShowInviteModal(false)}>ยกเลิก</button>
            <button className="settings-primary" type="button" style={{ opacity: teamAccess.canInvite ? 1 : 0.4, pointerEvents: teamAccess.canInvite ? "auto" : "none" }} onClick={() => setShowInviteModal(false)}><span>ส่ง</span></button>
          </div>
        </div>
      </div>

      <div className={joinClasses("modal-overlay", showCreateModal && "is-open")} id="create-modal" role="dialog" aria-modal="true" onClick={(event) => {
        if (event.target === event.currentTarget) {
          setShowCreateModal(false);
          setCreateStep(1);
          setCreateFormData({ projectName: "", concept: "", songCount: "1" });
        }
      }}>
        <div className="modal">
          {createStep === 1 ? (
            <>
              <h2 className="modal-title">สร้างโปรเจกต์ใหม่</h2>
              <div id="modal-rows" style={{ marginTop: 20 }}>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 6, display: "block" }}>ชื่อโปรเจกต์</label>
                  <input className="modal-input" type="text" placeholder="ชื่อโปรเจกต์" value={createFormData.projectName} onChange={(event) => setCreateFormData({ ...createFormData, projectName: event.target.value })} />
                </div>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 6, display: "block" }}>แนวคิด / Theme</label>
                  <input className="modal-input" type="text" placeholder="แนวคิดหรือธีม" value={createFormData.concept} onChange={(event) => setCreateFormData({ ...createFormData, concept: event.target.value })} />
                </div>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 6, display: "block" }}>จำนวนเพลง</label>
                  <input className="modal-input" type="number" min="1" value={createFormData.songCount} onChange={(event) => setCreateFormData({ ...createFormData, songCount: event.target.value })} />
                </div>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 8, display: "block" }}>เป้าหมาย (เลือกได้หลายข้อ)</label>
                  <div className="ss-goal-chips">
                    {["🎤 โปรโมทศิลปิน", "📺 เพลงโฆษณา", "💿 อัลบั้ม", "🎬 ประกอบภาพยนตร์/ซีรีส์", "📱 Content / Social Media"].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className={joinClasses("ss-goal-chip", projectGoals.includes(goal) && "is-active")}
                        onClick={() => toggleProjectGoal(goal)}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="modal-title">ความคิดเห็นและแนวคิด</h2>
              <div id="modal-rows" style={{ marginTop: 20 }}>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 8, display: "block" }}>ประเภทเพลง (เลือกได้หลายข้อ)</label>
                  <div className="ss-goal-chips">
                    {["Pop", "R&B", "Jazz", "Rock", "Thai Traditional", "EDM", "Hip-Hop", "Country", "Classical", "Indie"].map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        className={joinClasses("ss-goal-chip", projectGenres.includes(genre) && "is-active")}
                        onClick={() => toggleProjectGenre(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 6, display: "block" }}>อัปโหลดไฟล์อ้างอิง</label>
                  <div style={{ border: "2px dashed #d1d5db", borderRadius: 8, padding: 20, textAlign: "center", cursor: "pointer" }}>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>ลากไฟล์มาวางที่นี่หรือคลิกเพื่ออัปโหลด</div>
                  </div>
                </div>
                <div className="modal-row">
                  <label style={{ fontSize: 12, color: "#8a8c91", marginBottom: 6, display: "block" }}>บันทึกการคิดสร้างสรรค์</label>
                  <textarea className="modal-input" placeholder="บันทึกความคิดและแนวคิดของคุณ" style={{ minHeight: 100, resize: "vertical", fontFamily: "system-ui" }} />
                </div>
              </div>
            </>
          )}

          <div className="modal-footer">
            <button className="modal-cancel" type="button" onClick={() => {
              setShowCreateModal(false);
              setCreateStep(1);
              setCreateFormData({ projectName: "", concept: "", songCount: "1" });
            }}>ยกเลิก</button>
            <button className="settings-primary" type="button" onClick={handleCreateProject}><span>{createStep === 1 ? "ต่อไป" : "สร้างโปรเจกต์"}</span></button>
          </div>
        </div>
      </div>

      <DebugRolePanel role={debugRole} onRoleChange={setDebugRole} />
    </div>
  );
}

function renderNavigationItem({ item, openGroups, setOpenGroups, view, onNavigate }: any) {
  if (item.type === "link") {
    return (
      <button
        key={item.key}
        className={joinClasses("nav-link", isActiveView(view, item.view) && "active", item.locked && "is-locked")}
        type="button"
        data-nav-link
        style={{ "--delay": `${item.delay}ms` } as any}
        title={item.locked ? item.lockedReason : undefined}
        onClick={() => {
          if (!item.locked) onNavigate(item.view);
        }}
      >
        <span className="nav-link__main">
          <span className="nav-icon"><item.icon /></span>
          <span>{item.label}</span>
        </span>
        {item.locked ? <span className="nav-lock" aria-hidden="true"><LockIcon /></span> : null}
      </button>
    );
  }

  const childActive = item.children.some((child: any) => isActiveView(view, child.view));
  const isOpen = childActive || openGroups[item.key];

  return (
    <div key={item.key} className="nav-group" data-open={isOpen ? "true" : "false"}>
      <div className="nav-group__row" style={{ "--delay": `${item.delay}ms` } as any}>
        <button
          className={joinClasses("nav-link", "nav-link--group", childActive && "is-current", item.locked && "is-locked")}
          type="button"
          data-nav-link
          data-group-parent
          title={item.locked ? item.lockedReason : undefined}
          onClick={() => {
            const firstUnlockedChild = item.children.find((child: any) => !child.locked);
            if (firstUnlockedChild) onNavigate(firstUnlockedChild.view);
          }}
        >
          <span className="nav-link__main">
            <span className="nav-icon"><item.icon /></span>
            <span>{item.label}</span>
          </span>
          {item.locked ? <span className="nav-lock" aria-hidden="true"><LockIcon /></span> : null}
        </button>

        <button className="nav-group-toggle" type="button" aria-expanded={isOpen} data-group-toggle onClick={() => setOpenGroups((current: any) => ({ ...current, [item.key]: !current[item.key] }))}>
          <span className="nav-chevron"><ChevronIcon /></span>
        </button>
      </div>

      <div className="nav-subnav" style={{ maxHeight: isOpen ? item.children.length * 32 + 12 : 0 }}>
        {item.children.map((child: any) => (
          <button
            key={child.key}
            className={joinClasses("nav-sublink", isActiveView(view, child.view) && "active", child.locked && "is-locked")}
            type="button"
            data-nav-link
            title={child.locked ? child.lockedReason : undefined}
            onClick={() => {
              if (!child.locked) onNavigate(child.view);
            }}
          >
            {child.label}
            {child.locked ? <span className="nav-lock" aria-hidden="true"><LockIcon /></span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function PageAccessBanner({ access }: any) {
  if (!access?.canView) {
    return null;
  }

  if (access.canWrite || access.canDelete || access.canInvite) {
    return <div className="page-access-banner is-editable">{access.note}</div>;
  }

  return <div className="page-access-banner is-readonly">{access.note}</div>;
}

export default WorkspacePage;
