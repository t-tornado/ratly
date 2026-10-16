import { useNavigate } from "react-router-dom";
import { FilterBar } from "../../../../components/FilterBar";
import { DataTable } from "../../../../components/DataTable";
import type { UserRow } from "../../../../components/DataTable";
import type { FilterOption } from "../../../../components/FilterBar";
import { routes } from "../../../../routes";

const MOCK_ROWS: UserRow[] = [
  {
    id: "usr_7c21e9",
    remaining: 0,
    total: 100,
    resetTime: "14:19:07",
    resetIn: "2m 14s",
    status: "exceeded",
    statusLabel: "Exceeded",
    lastRequest: "3s ago",
  },
  {
    id: "usr_a4f02b",
    remaining: 0,
    total: 100,
    resetTime: "14:28:33",
    resetIn: "11m 40s",
    status: "exceeded",
    statusLabel: "Exceeded",
    lastRequest: "18s ago",
  },
  {
    id: "usr_3e88d1",
    remaining: 6,
    total: 100,
    resetTime: "14:21:07",
    resetIn: "4m 02s",
    status: "warning",
    statusLabel: "Warning",
    lastRequest: "1s ago",
  },
  {
    id: "usr_d71c05",
    remaining: 8,
    total: 100,
    resetTime: "14:24:48",
    resetIn: "7m 55s",
    status: "warning",
    statusLabel: "Warning",
    lastRequest: "6s ago",
  },
  {
    id: "usr_91bd47",
    remaining: 34,
    total: 125,
    resetTime: "14:39:03",
    resetIn: "22m 10s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "12s ago",
    tags: [{ label: "+25 extra", variant: "tag-info" }],
  },
  {
    id: "usr_c02e7a",
    remaining: 41,
    total: 150,
    resetTime: "14:47:56",
    resetIn: "31m 03s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "40s ago",
    tags: [{ label: "limit 150", variant: "tag-info" }],
  },
  {
    id: "usr_5f1c30",
    remaining: 27,
    total: 100,
    resetTime: "14:55:13",
    resetIn: "38m 20s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "2m ago",
  },
  {
    id: "usr_2b6f84",
    remaining: 0,
    total: 100,
    resetTime: "15:01:42",
    resetIn: "44m 49s",
    status: "exceeded",
    statusLabel: "Exceeded",
    lastRequest: "5m ago",
    tags: [{ label: "paused 45m", variant: "tag-warning" }],
  },
  {
    id: "usr_6a3fd0",
    remaining: 88,
    total: 100,
    resetTime: "15:08:05",
    resetIn: "51m 12s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "38m ago",
  },
  {
    id: "usr_0d94bc",
    remaining: 97,
    total: 100,
    resetTime: "15:15:40",
    resetIn: "58m 47s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "3h ago",
  },
  {
    id: "usr_e4b291",
    remaining: 55,
    total: 100,
    resetTime: "15:22:18",
    resetIn: "5m 25s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "12m ago",
  },
  {
    id: "usr_f8c3a7",
    remaining: 3,
    total: 100,
    resetTime: "15:30:44",
    resetIn: "13m 51s",
    status: "warning",
    statusLabel: "Warning",
    lastRequest: "45s ago",
  },
  {
    id: "usr_b19d06",
    remaining: 0,
    total: 100,
    resetTime: "15:35:10",
    resetIn: "18m 17s",
    status: "exceeded",
    statusLabel: "Exceeded",
    lastRequest: "2s ago",
  },
  {
    id: "usr_ca72e5",
    remaining: 71,
    total: 100,
    resetTime: "15:42:33",
    resetIn: "25m 40s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "8m ago",
  },
  {
    id: "usr_d03f18",
    remaining: 46,
    total: 100,
    resetTime: "15:49:02",
    resetIn: "32m 09s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "15m ago",
  },
  {
    id: "usr_ae5c94",
    remaining: 12,
    total: 100,
    resetTime: "15:53:27",
    resetIn: "36m 34s",
    status: "warning",
    statusLabel: "Warning",
    lastRequest: "22s ago",
  },
  {
    id: "usr_7b20df",
    remaining: 63,
    total: 100,
    resetTime: "16:01:15",
    resetIn: "44m 22s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "1h ago",
  },
  {
    id: "usr_39e8c1",
    remaining: 0,
    total: 100,
    resetTime: "16:08:50",
    resetIn: "51m 57s",
    status: "exceeded",
    statusLabel: "Exceeded",
    lastRequest: "30s ago",
  },
  {
    id: "usr_52af7b",
    remaining: 82,
    total: 100,
    resetTime: "16:14:09",
    resetIn: "57m 16s",
    status: "ok",
    statusLabel: "OK",
    lastRequest: "2h ago",
  },
  {
    id: "usr_c6d403",
    remaining: 19,
    total: 200,
    resetTime: "16:20:38",
    resetIn: "3m 45s",
    status: "warning",
    statusLabel: "Warning",
    lastRequest: "4s ago",
    tags: [{ label: "limit 200", variant: "tag-info" }],
  },
];

const FILTERS: FilterOption[] = [
  { label: "All", count: 20, active: true },
  { label: "OK", count: 10 },
  { label: "Warning", count: 5, color: "var(--color-warning)" },
  { label: "Exceeded", count: 5, color: "var(--color-error)" },
];

const TIME_OPTIONS = [
  { label: "any time", value: "any" },
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
];

function DashboardUsersTable() {
  const navigate = useNavigate();

  return (
    <div data-testid="dashboard-users-table" className="flex flex-col gap-3">
      <FilterBar
        filters={FILTERS}
        selectLabel="Last active"
        selectOptions={TIME_OPTIONS}
      />
      <DataTable
        rows={MOCK_ROWS}
        onRowClick={(userId) => navigate(routes.userDetail(userId))}
        footer={
          <>
            <span>20 of 20 shown &middot; sorted by usage &darr;</span>
            <span>Warning &ge; 90% used &middot; Exceeded = 100%</span>
          </>
        }
      />
    </div>
  );
}

export { DashboardUsersTable };
