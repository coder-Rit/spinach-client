import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ProjectContextProvider } from "./context/ProjectContext";
import { AuthContextProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container is missing in index.html");
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ProjectContextProvider>
          <AuthContextProvider>
            <App />
          </AuthContextProvider>
        </ProjectContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
