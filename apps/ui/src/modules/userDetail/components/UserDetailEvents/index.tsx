import { EventStream } from "../../../../components/EventStream";
import { useUserDetailEvents } from "../../hooks/useUserDetailEvents";

interface UserDetailEventsProps {
  userId: string;
}

function UserDetailEvents({ userId }: UserDetailEventsProps) {
  const events = useUserDetailEvents(userId);

  return (
    <div data-testid="user-detail-events">
      <EventStream title="Event stream" events={events} />
    </div>
  );
}

export { UserDetailEvents, type UserDetailEventsProps };
