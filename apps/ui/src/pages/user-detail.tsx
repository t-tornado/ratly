import { useParams, Link } from "react-router-dom";
import { routes } from "../routes";

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link to={routes.dashboard} className="text-sm text-primary underline">
        &larr; Back to dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{userId}</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Used</p>
          <p className="text-2xl font-bold">87</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Limit</p>
          <p className="text-2xl font-bold">100</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold">13</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Admin actions and live data will be wired here.
      </p>
    </div>
  );
}
