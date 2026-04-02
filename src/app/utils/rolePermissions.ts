export const DEBUG_ROLE_OPTIONS = [
  "Admin",
  "Producer",
  "A&R",
  "Engineer",
  "Musician",
  "Viewer",
];

const ROLE_PERMISSIONS = {
  Admin: {
    viewSettings: true,
    writeSettings: true,
    deleteSettings: false,
    viewTeam: true,
    writeTeam: true,
    deleteTeam: true,
    inviteUsers: true,
    deleteInvites: true,
    viewRoles: true,
    writeRoles: true,
    deleteRoles: true,
    viewProjects: true,
    createProject: true,
    deleteProject: true,
    viewArtists: true,
    exportRevenue: true,
    viewContracts: true,
    writeContracts: true,
    deleteContracts: true,
    viewProfile: true,
    writeProfile: true,
    manageStudio: true,
    manageTeam: true,
    viewRevenue: true,
    manageContracts: true,
    editProjectInfo: true,
    writeSong: true,
    uploadFiles: true,
    reviewAudio: true,
    approveMaster: true,
    releaseProject: true,
  },
  Producer: {
    viewSettings: true,
    writeSettings: false,
    deleteSettings: false,
    viewTeam: true,
    writeTeam: false,
    deleteTeam: false,
    inviteUsers: false,
    deleteInvites: false,
    viewRoles: true,
    writeRoles: false,
    deleteRoles: false,
    viewProjects: true,
    createProject: true,
    deleteProject: false,
    viewArtists: true,
    exportRevenue: true,
    viewContracts: true,
    writeContracts: true,
    deleteContracts: false,
    viewProfile: true,
    writeProfile: true,
    manageStudio: false,
    manageTeam: false,
    viewRevenue: true,
    manageContracts: true,
    editProjectInfo: true,
    writeSong: true,
    uploadFiles: true,
    reviewAudio: true,
    approveMaster: true,
    releaseProject: true,
  },
  "A&R": {
    viewSettings: false,
    writeSettings: false,
    deleteSettings: false,
    viewTeam: true,
    writeTeam: false,
    deleteTeam: false,
    inviteUsers: false,
    deleteInvites: false,
    viewRoles: true,
    writeRoles: false,
    deleteRoles: false,
    viewProjects: true,
    createProject: false,
    deleteProject: false,
    viewArtists: true,
    exportRevenue: false,
    viewContracts: true,
    writeContracts: false,
    deleteContracts: false,
    viewProfile: true,
    writeProfile: true,
    manageStudio: false,
    manageTeam: false,
    viewRevenue: false,
    manageContracts: false,
    editProjectInfo: false,
    writeSong: false,
    uploadFiles: false,
    reviewAudio: true,
    approveMaster: false,
    releaseProject: false,
  },
  Engineer: {
    viewSettings: false,
    writeSettings: false,
    deleteSettings: false,
    viewTeam: true,
    writeTeam: false,
    deleteTeam: false,
    inviteUsers: false,
    deleteInvites: false,
    viewRoles: false,
    writeRoles: false,
    deleteRoles: false,
    viewProjects: true,
    createProject: false,
    deleteProject: false,
    viewArtists: true,
    exportRevenue: false,
    viewContracts: false,
    writeContracts: false,
    deleteContracts: false,
    viewProfile: true,
    writeProfile: true,
    manageStudio: false,
    manageTeam: false,
    viewRevenue: false,
    manageContracts: false,
    editProjectInfo: false,
    writeSong: false,
    uploadFiles: true,
    reviewAudio: true,
    approveMaster: false,
    releaseProject: false,
  },
  Musician: {
    viewSettings: false,
    writeSettings: false,
    deleteSettings: false,
    viewTeam: true,
    writeTeam: false,
    deleteTeam: false,
    inviteUsers: false,
    deleteInvites: false,
    viewRoles: false,
    writeRoles: false,
    deleteRoles: false,
    viewProjects: true,
    createProject: false,
    deleteProject: false,
    viewArtists: true,
    exportRevenue: false,
    viewContracts: false,
    writeContracts: false,
    deleteContracts: false,
    viewProfile: true,
    writeProfile: true,
    manageStudio: false,
    manageTeam: false,
    viewRevenue: false,
    manageContracts: false,
    editProjectInfo: false,
    writeSong: false,
    uploadFiles: true,
    reviewAudio: false,
    approveMaster: false,
    releaseProject: false,
  },
  Viewer: {
    viewSettings: false,
    writeSettings: false,
    deleteSettings: false,
    viewTeam: false,
    writeTeam: false,
    deleteTeam: false,
    inviteUsers: false,
    deleteInvites: false,
    viewRoles: false,
    writeRoles: false,
    deleteRoles: false,
    viewProjects: true,
    createProject: false,
    deleteProject: false,
    viewArtists: true,
    exportRevenue: false,
    viewContracts: false,
    writeContracts: false,
    deleteContracts: false,
    viewProfile: true,
    writeProfile: false,
    manageStudio: false,
    manageTeam: false,
    viewRevenue: false,
    manageContracts: false,
    editProjectInfo: false,
    writeSong: false,
    uploadFiles: false,
    reviewAudio: false,
    approveMaster: false,
    releaseProject: false,
  },
};

export const ROLE_PERMISSION_LABELS = [
  ["editProjectInfo", "Edit project info"],
  ["writeSong", "Write song / lyrics"],
  ["uploadFiles", "Upload stems/files"],
  ["reviewAudio", "Review mix/master"],
  ["approveMaster", "Approve master"],
  ["releaseProject", "Submit release"],
  ["manageContracts", "Manage contracts"],
  ["manageStudio", "Studio settings"],
  ["manageTeam", "Team and roles"],
  ["viewRevenue", "View revenue"],
];

const VIEW_RULES = [
  { match: (view) => view?.page === "admin", roles: ["Admin", "Producer"], label: "Studio settings", permission: "viewSettings" },
  { match: (view) => view?.page === "team", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician"], label: "Team", permission: "viewTeam" },
  { match: (view) => view?.page === "roles", roles: ["Admin", "Producer", "A&R"], label: "Roles", permission: "viewRoles" },
  { match: (view) => view?.page === "release", roles: ["Admin", "Producer"], label: "Revenue and release", permission: "viewRevenue" },
  { match: (view) => view?.genericKey === "contracts", roles: ["Admin", "Producer", "A&R"], label: "Contracts", permission: "viewContracts" },
  { match: (view) => view?.page === "projects", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician", "Viewer"], label: "Projects", permission: "viewProjects" },
  { match: (view) => view?.page === "organizations", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician", "Viewer"], label: "Artists", permission: "viewArtists" },
  { match: (view) => view?.page === "profile", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician", "Viewer"], label: "Profile", permission: "viewProfile" },
];

function formatRoleList(roles) {
  if (!roles.length) return "all roles";
  if (roles.length === 1) return roles[0];
  if (roles.length === 2) return `${roles[0]} or ${roles[1]}`;
  return `${roles.slice(0, -1).join(", ")}, or ${roles[roles.length - 1]}`;
}

function getViewRule(view) {
  return VIEW_RULES.find((rule) => rule.match(view)) ?? null;
}

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.Viewer;
}

export function getRoleCapabilities(role) {
  const permissions = getRolePermissions(role);
  return ROLE_PERMISSION_LABELS.map(([key, label]) => ({
    key,
    label,
    enabled: Boolean(permissions[key]),
  }));
}

export function canAccessView(view, permissions) {
  const rule = getViewRule(view);
  if (!rule) return true;

  return Boolean(permissions[rule.permission]);
}

export function describeViewRestriction(view) {
  const rule = getViewRule(view);
  if (!rule) return null;

  return `Requires ${formatRoleList(rule.roles)} access to ${rule.label.toLowerCase()}.`;
}

const PAGE_ACCESS_RULES = {
  settings: { view: "viewSettings", write: "writeSettings", delete: "deleteSettings", label: "Settings", roles: ["Admin", "Producer"] },
  team: { view: "viewTeam", write: "writeTeam", delete: "deleteTeam", invite: "inviteUsers", deleteInvites: "deleteInvites", label: "Team", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician"] },
  roles: { view: "viewRoles", write: "writeRoles", delete: "deleteRoles", label: "Roles", roles: ["Admin", "Producer", "A&R"] },
  revenue: { view: "viewRevenue", write: "exportRevenue", delete: null, label: "Revenue", roles: ["Admin", "Producer"] },
  contracts: { view: "viewContracts", write: "writeContracts", delete: "deleteContracts", label: "Contracts", roles: ["Admin", "Producer", "A&R"] },
  profile: { view: "viewProfile", write: "writeProfile", delete: null, label: "Profile", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician", "Viewer"] },
  projects: { view: "viewProjects", write: "createProject", delete: "deleteProject", label: "Projects", roles: ["Admin", "Producer", "A&R", "Engineer", "Musician", "Viewer"] },
};

export function getPageAccess(pageKey, role, permissions) {
  const rule = PAGE_ACCESS_RULES[pageKey];
  if (!rule) {
    return { canView: true, canWrite: false, canDelete: false, canInvite: false, canDeleteInvites: false, note: null };
  }

  const canView = Boolean(permissions[rule.view]);
  const canWrite = rule.write ? Boolean(permissions[rule.write]) : false;
  const canDelete = rule.delete ? Boolean(permissions[rule.delete]) : false;
  const canInvite = rule.invite ? Boolean(permissions[rule.invite]) : false;
  const canDeleteInvites = rule.deleteInvites ? Boolean(permissions[rule.deleteInvites]) : false;

  let note = `${role} can view this page in read-only mode.`;
  if (!canView) {
    note = `Requires ${formatRoleList(rule.roles)} access to ${rule.label.toLowerCase()}.`;
  } else if (canWrite || canDelete || canInvite) {
    note = `${role} has write access to ${rule.label.toLowerCase()}.`;
  }

  return { canView, canWrite, canDelete, canInvite, canDeleteInvites, note, requiredRoles: rule.roles };
}

export function filterNavigationByRole(items, permissions) {
  return items.map((item) => {
    if (item.type === "link") {
      return {
        ...item,
        locked: !canAccessView(item.view, permissions),
        lockedReason: describeViewRestriction(item.view),
      };
    }

    const children = item.children.map((child) => ({
      ...child,
      locked: !canAccessView(child.view, permissions),
      lockedReason: describeViewRestriction(child.view),
    }));

    return {
      ...item,
      locked: children.every((child) => child.locked),
      lockedReason: children.every((child) => child.locked) ? describeViewRestriction(children[0]?.view) : null,
      children,
    };
  });
}

const PROJECT_STEP_RULES = [
  { key: "project-info", permission: "editProjectInfo", roles: ["Admin", "Producer"], denied: "cannot change project info" },
  { key: "songwriting", permission: "writeSong", roles: ["Admin", "Producer"], denied: "cannot write the song" },
  { key: "arrangement", permission: "writeSong", roles: ["Admin", "Producer"], denied: "can view arrangement only" },
  { key: "recording", permission: "uploadFiles", roles: ["Admin", "Producer", "Engineer", "Musician"], denied: "cannot upload recording files" },
  { key: "mixing", permission: "reviewAudio", roles: ["Admin", "Producer", "A&R", "Engineer"], denied: "can review notes only" },
  { key: "mastering", permission: "approveMaster", roles: ["Admin", "Producer"], denied: "cannot approve the master" },
  { key: "legal", permission: "manageContracts", roles: ["Admin", "Producer"], denied: "cannot manage legal signatures" },
  { key: "release", permission: "releaseProject", roles: ["Admin", "Producer"], denied: "cannot submit the release" },
];

export function getProjectStepAccess(role, permissions) {
  return PROJECT_STEP_RULES.map((rule) => ({
    key: rule.key,
    editable: Boolean(permissions[rule.permission]),
    requiredRoles: rule.roles,
    message: permissions[rule.permission]
      ? `${role} can edit this step.`
      : `${role} ${rule.denied}. Requires ${formatRoleList(rule.roles)}.`,
  }));
}

export function getProjectListAccess(role, permissions) {
  if (permissions.editProjectInfo || permissions.releaseProject) {
    return {
      mode: "Can manage",
      revenueVisible: permissions.viewRevenue,
      note: `${role} can open and manage project details.`,
    };
  }

  if (permissions.uploadFiles || permissions.reviewAudio || permissions.manageContracts) {
    return {
      mode: "Contribute",
      revenueVisible: permissions.viewRevenue,
      note: `${role} can open projects with limited workflow actions.`,
    };
  }

  return {
    mode: "Read only",
    revenueVisible: false,
    note: `${role} can open projects in read-only mode.`,
  };
}
