import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LandingContent from "./LandingContent";
export function renderLanding() {
  return renderToStaticMarkup(<LandingContent />);
}
