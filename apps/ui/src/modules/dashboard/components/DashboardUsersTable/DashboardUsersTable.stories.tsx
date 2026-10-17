import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardUsersTable } from "./index";
import { mockRows } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardUsersTable> = {
  title: "Dashboard/DashboardUsersTable",
  component: DashboardUsersTable,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardUsersTable>;

export const Populated: Story = {
  args: { rows: mockRows },
};

export const Empty: Story = {
  args: { rows: [] },
};
