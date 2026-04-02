import { joinClasses } from "../../utils/workspace";

export function PageTitleWithIcon({ icon, title }) {
  return (
    <div className="page-title-wrap">
      {icon ? <span className="page-title-badge" aria-hidden="true">{icon}</span> : null}
      <h1 className="page-title">{title}</h1>
    </div>
  );
}

export function TitleWithIcon({ as: Tag = "div", icon, children, className = "" }) {
  return (
    <Tag className={joinClasses(className, "title-with-icon")}>
      <span className="title-with-icon__icon" aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </Tag>
  );
}
