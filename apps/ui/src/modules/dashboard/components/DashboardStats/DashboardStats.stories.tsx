import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardStats } from "./index";
import { mockStats } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardStats> = {
  title: "Dashboard/DashboardStats",
  component: DashboardStats,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardStats>;

export const Loaded: Story = {
  args: { stats: mockStats, isLoading: false },
};

export const Loading: Story = {
  args: { stats: null, isLoading: true },
};
