import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ModeSelection from "./ModeSelection.jsx";
import { BrowserRouter, Routes } from "react-router-dom";
import RouteDefinitions from "./RouteDefinitions.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <RouteDefinitions />
    </BrowserRouter>
  </StrictMode>
);
