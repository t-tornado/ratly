import { LiveEventsFeed } from "../../../../components/LiveEventsFeed";
import type { LiveEvent } from "../../../../components/LiveEventsFeed";

interface DashboardLiveEventsProps {
  liveEvents: LiveEvent[];
}

function DashboardLiveEvents({ liveEvents }: DashboardLiveEventsProps) {
  return (
    <LiveEventsFeed
      data-testid="dashboard-live-events"
      events={liveEvents}
    />
  );
}

export { DashboardLiveEvents };
