import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { LoadingScreen } from "./components/LoadingScreen";

const DashboardPage = lazy(() => import("./modules/dashboard"));
const UserDetailPage = lazy(() => import("./modules/userDetail"));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
