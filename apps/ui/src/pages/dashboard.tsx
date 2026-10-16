import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { routes } from "../routes";

const MOCK_USERS = [
  { id: "user-1", used: 87, limit: 100, status: "warning" },
  { id: "user-2", used: 42, limit: 100, status: "ok" },
  { id: "user-3", used: 100, limit: 100, status: "exceeded" },
];

const statusColor: Record<string, string> = {
  ok: "text-green-600",
  warning: "text-amber-500",
  exceeded: "text-red-600",
};

export default function Dashboard() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () =>
      fetch("http://localhost:3000/v1/health").then((r) => r.json()),
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Ratly Dashboard</h1>

      <div className="mt-4 rounded-md border p-4">
        <p className="text-sm text-muted-foreground">Server status</p>
        <p className="font-mono text-sm">
          {health.isLoading && "Connecting..."}
          {health.isError && (
            <span className="text-red-600">Offline — {health.error.message}</span>
          )}
          {health.data && (
            <span className="text-green-600">{health.data.message}</span>
          )}
        </p>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2">User ID</th>
            <th>Usage</th>
            <th>Remaining</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_USERS.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">
                <Link to={routes.userDetail(u.id)} className="text-primary underline">
                  {u.id}
                </Link>
              </td>
              <td>
                {u.used}/{u.limit}
              </td>
              <td>{u.limit - u.used}</td>
              <td className={statusColor[u.status]}>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
