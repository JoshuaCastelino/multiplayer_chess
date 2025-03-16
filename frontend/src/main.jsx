import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouteDefinitions from "./RouteDefinitions.jsx";
import "./index.css";
import Login from "./Login.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          >
          <RouteDefinitions />
        </GoogleOAuthProvider>
      }
    </BrowserRouter>
  </StrictMode>
);
