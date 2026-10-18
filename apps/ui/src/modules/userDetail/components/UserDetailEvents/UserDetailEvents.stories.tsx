import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDetailEvents } from ".";

const meta = {
  component: UserDetailEvents,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    userId: "usr_demo_001",
  },
} satisfies Meta<typeof UserDetailEvents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
