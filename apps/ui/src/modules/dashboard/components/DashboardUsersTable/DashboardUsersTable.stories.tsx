import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardUsersTable } from ".";

const meta = {
  component: DashboardUsersTable,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardUsersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
