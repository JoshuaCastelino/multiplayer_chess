import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router-dom";
import RouteDefinitions from "./RouteDefinitions.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <RouteDefinitions />
    </BrowserRouter>
  </StrictMode>
);
