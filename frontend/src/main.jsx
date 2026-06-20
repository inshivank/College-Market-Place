import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MessagingProvider } from "./context/MessagingContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MessagingProvider><App /></MessagingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
