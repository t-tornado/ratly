import { LiveEventsFeed } from "../../../../components/LiveEventsFeed";
import type { LiveEvent } from "../../../../components/LiveEventsFeed";

const MOCK_EVENTS: LiveEvent[] = [
  {
    time: "16:53",
    type: "rate:limit_exceeded",
    description: "usr_7c21e9 \u00b7 retry 14:19:07",
    severity: "error",
  },
  {
    time: "16:53",
    type: "rate:update",
    description: "usr_3e88d1 \u00b7 6 left",
    severity: "info",
  },
  {
    time: "16:52",
    type: "rate:update",
    description: "usr_d71c05 \u00b7 8 left",
    severity: "info",
  },
  {
    time: "16:50",
    type: "rate:update",
    description: "usr_91bd47 \u00b7 +25 bonus by admin",
    severity: "info",
  },
  {
    time: "16:47",
    type: "rate:limit_exceeded",
    description: "usr_a4f02b \u00b7 retry 14:28:33",
    severity: "error",
  },
  {
    time: "16:45",
    type: "rate:update",
    description: "usr_5f1c30 \u00b7 27 left",
    severity: "info",
  },
];

function DashboardLiveEvents() {
  return (
    <LiveEventsFeed
      data-testid="dashboard-live-events"
      events={MOCK_EVENTS}
    />
  );
}

export { DashboardLiveEvents };
