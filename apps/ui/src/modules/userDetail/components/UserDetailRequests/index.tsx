import { RequestsTable } from "../../../../components/RequestsTable";

function UserDetailRequests() {
  return (
    <div data-testid="user-detail-requests">
      <RequestsTable title="Recent requests" rows={[]} />
    </div>
  );
}

export { UserDetailRequests };
