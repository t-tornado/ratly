import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDetailActivity } from ".";

const meta = {
  component: UserDetailActivity,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof UserDetailActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
