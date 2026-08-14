import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import PosterMaker from "./pages/PosterMaker.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/poster-maker" element={<PosterMaker />} />
    </Routes>
  );
}
