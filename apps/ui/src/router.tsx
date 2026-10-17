import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";

const DashboardPage = lazy(() => import("./modules/dashboard"));
const UserDetailPage = lazy(() => import("./modules/userDetail"));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
