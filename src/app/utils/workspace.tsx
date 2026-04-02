export function isActiveView(current, target) {
  return current.navId === target.navId;
}

export function updateInviteRow(setInviteRows, index, field, value) {
  setInviteRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
}

export function handleRowEnter(event, action) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

export function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();
}

export function formatCurrency(value) {
  if (value == null) {
    return "—";
  }

  return `$${value.toLocaleString("en-US")}`;
}

export function renderWorkflowDots(progress) {
  return (
    <div className="sdots" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => {
        const step = index + 1;
        const className = step < progress ? "sdo sdo--d" : step === progress ? "sdo sdo--c" : "sdo";
        return <span key={step} className={className} />;
      })}
    </div>
  );
}

export function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

export function resolveStageClass(page) {
  if (page === "dashboard") return "is-home";
  if (page === "admin") return "is-settings";
  if (page === "team") return "is-team";
  if (page === "roles") return "is-roles";
  if (page === "profile") return "is-user";
  if (page === "projects") return "is-projects";
  if (page === "release") return "is-revenue";
  if (page === "organizations") return "is-artists";
  // Handle song studio stages - v2 pipeline
  if (page === "draft") return "is-draft";
  if (page === "briefed") return "is-projects";
  if (page === "lyrics-done") return "is-projects";
  if (page === "reference-done") return "is-projects";
  if (page === "arranged") return "is-arranged";
  if (page === "recorded") return "is-projects";
  if (page === "mixed") return "is-mixed";
  if (page === "mastered") return "is-mastered";
  if (page === "rights-signed") return "is-rights-signed";
  if (page === "released") return "is-released";
  // Legacy stages
  if (page === "lyrics") return "is-lyrics";
  if (page === "composed") return "is-composed";
  if (page === "recording") return "is-recording";
  return "is-generic";
}
