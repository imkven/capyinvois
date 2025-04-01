import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router";

import "./index.css";

import EditEntityPage from "./pages/entities/edit/Page.tsx";
import CreateEntityPage from "./pages/entities/create/Page.tsx";
import EntitiesPage from "./pages/entities/Page.tsx";
import LandingPage from "./pages/Page.tsx";
import RootLayout from "./RootLayout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/entities/edit/:hash" element={<EditEntityPage />} />
          <Route path="/entities/create" element={<CreateEntityPage />} />
          <Route path="/entities" element={<EntitiesPage />} />
          <Route path="/" element={<LandingPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  </StrictMode>
);

/**
 {
  "ver": "0.1",
  "agent": "capyinvois",
  "data": {
    "entities": [
      {
        "name": "HQ",
        "data": {
          "name": "Company XYZ",
          "tin": "IG24876237000",
          "type": "NRIC",
          "id": "aaa",
          "sst": "sss",
          "addresses": "aaa",
          "email": "aa@aa.com",
          "contactNumber": "+601111111"
        },
        "hash": "ABCDXYZ",
        "hashAlgo": "xxhash"
      }
    ]
  },
  ...
}
 */
