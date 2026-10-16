import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import Dashboard from "./pages/dashboard";
import UserDetail from "./pages/user-detail";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.dashboard} element={<Dashboard />} />
        <Route path="/users/:userId" element={<UserDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
