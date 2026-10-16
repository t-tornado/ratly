import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import DashboardPage from "./modules/dashboard";
import UserDetailPage from "./modules/userDetail";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.dashboard} element={<DashboardPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
