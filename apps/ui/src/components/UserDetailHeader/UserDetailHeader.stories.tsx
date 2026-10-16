import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDetailHeader } from ".";

const meta = {
  component: UserDetailHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof UserDetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    backHref: "#",
    userId: "usr_3e88d1",
    status: "status-warning",
    statusLabel: "Warning",
    streaming: true,
    actions: [
      { label: "Reset window", variant: "destructive-ghost" },
      { label: "Adjust limit" },
      { label: "Add extra requests" },
      { label: "Pause throttling", variant: "primary" },
    ],
  },
};
