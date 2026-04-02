import { Suspense, lazy, type ComponentType } from "react";
import { Navigate, createBrowserRouter } from "react-router";
import { Root } from "./components/Root";

function RouteLoadingFallback() {
  return <div className="stage-loader" style={{ display: "flex" }} aria-hidden="true"><span className="stage-loader__spinner" /></div>;
}

function createLazyRoute<T extends Record<string, unknown>>(importer: () => Promise<T>, exportName: keyof T) {
  const LazyComponent = lazy(async () => {
    const module = await importer();
    const component = module[exportName] as ComponentType | undefined;

    if (!component) {
      throw new Error(`Missing export '${String(exportName)}' in lazy route module`);
    }

    return { default: component };
  });

  return function LazyRouteComponent() {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <LazyComponent />
      </Suspense>
    );
  };
}

const DemoPageRoute = createLazyRoute(() => import("./pages/DemoPage"), "default");
const WorkspacePageRoute = createLazyRoute(() => import("./pages/WorkspacePage"), "default");

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: DemoPageRoute },
      { path: "workspace", Component: WorkspacePageRoute },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
