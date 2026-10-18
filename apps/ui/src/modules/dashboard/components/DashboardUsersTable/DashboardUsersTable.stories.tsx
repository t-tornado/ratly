import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardUsersTable } from "./index";
import { mockRows, createMockRowEventStore } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardUsersTable> = {
  title: "Dashboard/DashboardUsersTable",
  component: DashboardUsersTable,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardUsersTable>;

export const Populated: Story = {
  args: { store: createMockRowEventStore(mockRows) },
};

export const Empty: Story = {
  args: { store: createMockRowEventStore([]) },
};

export const Mobile: Story = {
  args: { store: createMockRowEventStore(mockRows) },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
