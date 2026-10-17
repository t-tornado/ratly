import { EventStream } from "../../../../components/EventStream";

function UserDetailEvents() {
  return (
    <div data-testid="user-detail-events">
      <EventStream title="Event stream" events={[]} />
    </div>
  );
}

export { UserDetailEvents };
