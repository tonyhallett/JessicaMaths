import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Route, HashRouter as Router, Routes } from "react-router";

import "katex/dist/katex.min.css";
import Home from "./Home";
import { BookTest } from "./BookTest";
import { DemoDexie } from "./demoDexie/DemoDexie";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route
          path="booktest/:sectionIndex/:testIndex"
          element={<BookTest />}
        />
        <Route path="demodexie" element={<DemoDexie />} />
      </Route>
    </Routes>
  </Router>
);
