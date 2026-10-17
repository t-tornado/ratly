import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardTopUsers } from "./index";
import { mockStats } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardTopUsers> = {
  title: "Dashboard/DashboardTopUsers",
  component: DashboardTopUsers,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardTopUsers>;

export const Populated: Story = {
  args: { stats: mockStats },
};

export const NoData: Story = {
  args: { stats: null },
};
