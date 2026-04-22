import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ResourcePage from "./pages/ResourcePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/resources" element={<ResourcePage />} />
      </Routes>
    </BrowserRouter>
  );
}
