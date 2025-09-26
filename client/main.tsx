import { createRoot } from "react-dom/client";
import App from "./App";

// Fix for React 18 StrictMode double root creation warning
const container = document.getElementById("root")!;
let root = (container as any)._reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(<App />);