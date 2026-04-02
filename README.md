# NOVA Music OS - Demo

A React-based music workspace management application built with Vite and TypeScript. Includes API integration notebooks for Mureka and RoEx music AI services.

## Live Demo

Deployed via GitHub Pages with the static workflow.

## Tech Stack

- **React 18** with TypeScript
- **Vite 6** for build tooling
- **React Router 7** for routing
- **Chart.js** for data visualization
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  main.tsx                # App entry point
  styles.css              # Global styles
  styles/                 # Theme & font styles
  app/
    App.tsx               # Root app component
    routes.tsx            # Route definitions
    components/           # Reusable components
      workspace/          # Workspace-specific components
    pages/                # Page components (DemoPage, WorkspacePage)
    services/             # Data services
    utils/                # Utility functions & role permissions

Yue_module/               # Standalone HTML prototypes
ipynb_Mureka_RoEx_API/    # API integration notebooks & references
  *.ipynb                 # Jupyter notebooks for API testing
  *.md                    # API reference & handoff docs
  openapi.json            # OpenAPI specification
  test_stems/             # Sample audio stems for testing
```

## API Integration

The `ipynb_Mureka_RoEx_API/` directory contains Jupyter notebooks and documentation for integrating with music AI APIs (Mureka, RoEx), including:

- API reference documentation
- Test notebooks for endpoint validation
- OpenAPI specification
- Sample audio test files

## License

Proprietary - Nova AI Tech
