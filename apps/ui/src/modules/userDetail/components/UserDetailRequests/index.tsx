import { RequestsTable } from "../../../../components/RequestsTable";

const MOCK_REQUEST_ROWS = [
  { time: "14:16:53.212", method: "GET", path: "/v1/posts", status: 200, xCount: "6" },
  { time: "14:16:44.870", method: "POST", path: "/v1/comments", status: 201, xCount: "7" },
  { time: "14:16:31.045", method: "GET", path: "/v1/feed", status: 200, xCount: "8" },
  { time: "14:16:30.998", method: "GET", path: "/v1/feed", status: 200, xCount: "9" },
  { time: "14:16:12.400", method: "GET", path: "/v1/profile", status: 200, xCount: "10" },
  { time: "13:02:11.733", method: "GET", path: "/v1/feed", status: 429 },
  { time: "13:02:11.731", method: "GET", path: "/v1/feed", status: 429 },
];

function UserDetailRequests() {
  return (
    <div data-testid="user-detail-requests">
      <RequestsTable title="Recent requests" rows={MOCK_REQUEST_ROWS} />
    </div>
  );
}

export { UserDetailRequests };
