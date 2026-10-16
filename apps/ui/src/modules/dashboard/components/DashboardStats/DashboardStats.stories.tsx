import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardStats } from ".";

const meta = {
  component: DashboardStats,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
