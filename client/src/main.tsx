import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Initialize AWS Cognito configuration
import "./lib/cognito";

createRoot(document.getElementById("root")!).render(<App />);
