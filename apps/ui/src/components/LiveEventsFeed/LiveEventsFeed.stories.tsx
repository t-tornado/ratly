import type { Meta, StoryObj } from "@storybook/react-vite";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import { LiveEventsFeed } from ".";

const meta = {
  component: LiveEventsFeed,
  tags: ["autodocs"],
} satisfies Meta<typeof LiveEventsFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: [
      { time: "16:53", type: RATE_LIMIT_EXCEEDED_EVENT, description: "usr_7c21e9 · retry 14:19:07", severity: "error" },
      { time: "16:53", type: RATE_UPDATE_EVENT, description: "usr_3e88d1 · 6 left", severity: "info" },
      { time: "16:52", type: RATE_UPDATE_EVENT, description: "usr_d71c05 · 8 left", severity: "info" },
      { time: "16:50", type: RATE_UPDATE_EVENT, description: "usr_91bd47 · +25 bonus by admin", severity: "info" },
    ],
  },
};
