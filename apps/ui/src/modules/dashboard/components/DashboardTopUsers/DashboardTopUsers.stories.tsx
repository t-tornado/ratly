import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardTopUsers } from ".";

const meta = {
  component: DashboardTopUsers,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardTopUsers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
