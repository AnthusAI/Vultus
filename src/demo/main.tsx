import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BotAvatarDemo } from "./BotAvatarDemo";
import "./editorial.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Expected #root element for demo mount.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BotAvatarDemo />
  </StrictMode>
);
