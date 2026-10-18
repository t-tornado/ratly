import { EventStream } from "../../../../components/EventStream";
import { SectionHeading } from "../../../../components/SectionHeading";
import { useUserDetailEvents } from "../../hooks/useUserDetailEvents";
import { UserDetailEventsEmpty } from "../UserDetailEventsEmpty";

interface UserDetailEventsProps {
  userId: string;
}

function UserDetailEvents({ userId }: UserDetailEventsProps) {
  const events = useUserDetailEvents(userId);
  const isEmpty = events.length === 0;

  if (isEmpty) {
    return (
      <div data-testid="user-detail-events" className="h-full">
        <section className="rounded-xl border border-border-default bg-bg-surface-raised p-4 h-full flex flex-col">
          <SectionHeading>Event stream</SectionHeading>
          <div className="flex-1 flex items-center justify-center">
            <UserDetailEventsEmpty />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div data-testid="user-detail-events" className="h-full">
      <EventStream title="Event stream" events={events} className="h-full flex flex-col" />
    </div>
  );
}

export { UserDetailEvents, type UserDetailEventsProps };
