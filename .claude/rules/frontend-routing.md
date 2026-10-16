---
match: "apps/ui/**"
---

# Frontend Routing

All navigation paths go through `src/routes.ts`. No hardcoded route strings in components, hooks, or utilities.

## Routes config

- Static routes are plain strings: `dashboard: "/"`
- Dynamic routes are factory functions: `userDetail: (userId: string) => `/users/${userId}``
- All route entries live in `src/routes.ts`, nowhere else

## Usage

```tsx
import { routes } from "../routes";

// navigation
<Link to={routes.dashboard} />
<Link to={routes.userDetail(user.id)} />
navigate(routes.dashboard);

// never this
<Link to="/" />
<Link to={`/users/${id}`} />
```

## Route definitions

Route path patterns (the `path` prop on `<Route>`) live in `src/router.tsx`. This is the only file that imports page components and maps them to paths.

`src/router.tsx` also owns the `<BrowserRouter>` wrapper. `main.tsx` renders `<App>` which renders `<Router>`.
