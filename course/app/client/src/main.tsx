// Given: the entry point of the React app.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@app/client/src/App";
import { registerServiceWorker } from "@app/client/src/version";
import "@app/client/src/styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);

// Offline support (Part 9d). Only in the built app: in development it would cache files you are editing.
if (import.meta.env.PROD) registerServiceWorker("/sw.js");   // and switch to new versions by itself: see version.ts (11e)
