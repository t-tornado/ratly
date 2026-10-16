import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDetailRequests } from ".";

const meta = {
  component: UserDetailRequests,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof UserDetailRequests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
