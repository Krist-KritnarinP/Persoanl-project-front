/**
 * LoadingScreen — full-page spinner shown while a page fetches its data.
 * Used by trip pages (TripsActivity, ShareTripView) for a consistent look.
 */
import React from "react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
}
