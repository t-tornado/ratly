import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardLiveEvents } from ".";

const meta = {
  component: DashboardLiveEvents,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardLiveEvents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
