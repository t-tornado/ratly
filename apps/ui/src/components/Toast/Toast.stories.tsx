import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from ".";

const meta = {
  component: Toast,
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: "success",
    children: "Reconnected · resynced 1,284 users from snapshot",
  },
};

export const ErrorToast: Story = {
  args: {
    variant: "error",
    title: "usr_7c21e9 hit the limit",
    description: "Blocked until 14:19:07 · 3rd time today",
  },
};
