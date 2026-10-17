import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardLiveEvents } from "./index";
import { mockLiveEvents } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardLiveEvents> = {
  title: "Dashboard/DashboardLiveEvents",
  component: DashboardLiveEvents,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardLiveEvents>;

export const WithEvents: Story = {
  args: { liveEvents: mockLiveEvents },
};

export const Empty: Story = {
  args: { liveEvents: [] },
};
