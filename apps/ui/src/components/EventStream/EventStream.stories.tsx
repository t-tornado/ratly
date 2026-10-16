import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventStream } from ".";

const meta = {
  component: EventStream,
  tags: ["autodocs"],
} satisfies Meta<typeof EventStream>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Event stream · usr_3e88d1",
    events: [
      { type: "rate:update", timestamp: "14:16:53", description: "remaining 6 / 100 · resets 14:21:07", severity: "info" },
      { type: "rate:update", timestamp: "14:16:31", description: "remaining 8 / 100 · now Warning", severity: "warning" },
      { type: "rate:limit_exceeded", timestamp: "13:02:11", description: "blocked · retry at 13:04:40", severity: "error" },
      { type: "admin:reset", timestamp: "12:58:30", description: "window cleared by admin@spikerz", severity: "info" },
    ],
  },
};
