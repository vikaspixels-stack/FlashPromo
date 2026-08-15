import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";

const PosterMaker = lazy(() => import("./pages/PosterMaker.jsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route
        path="/poster-maker"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#0A1F1A]" />}>
            <PosterMaker />
          </Suspense>
        }
      />
    </Routes>
  );
}
