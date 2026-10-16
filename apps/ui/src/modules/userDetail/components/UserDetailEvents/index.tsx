import { EventStream } from "../../../../components/EventStream";

const MOCK_EVENTS = [
  {
    type: "rate:update",
    timestamp: "14:16:53",
    description: "remaining 6 / 100 · resets 14:21:07",
    severity: "info" as const,
  },
  {
    type: "rate:update",
    timestamp: "14:16:44",
    description: "remaining 7 / 100",
    severity: "info" as const,
  },
  {
    type: "rate:update",
    timestamp: "14:16:31",
    description: "remaining 8 / 100 · now Warning",
    severity: "info" as const,
  },
  {
    type: "rate:update",
    timestamp: "14:16:30",
    description: "remaining 9 / 100",
    severity: "info" as const,
  },
  {
    type: "rate:update",
    timestamp: "13:21:07",
    description: "new window · remaining 99 / 100",
    severity: "info" as const,
  },
  {
    type: "rate:limit_exceeded",
    timestamp: "13:02:11",
    description: "blocked · retry at 13:04:40",
    severity: "error" as const,
  },
  {
    type: "admin:reset",
    timestamp: "12:58:30",
    description: "window cleared by admin@spikerz",
    severity: "info" as const,
  },
];

function UserDetailEvents() {
  return (
    <div data-testid="user-detail-events">
      <EventStream title="Event stream · usr_3e88d1" events={MOCK_EVENTS} />
    </div>
  );
}

export { UserDetailEvents };
