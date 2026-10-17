import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardContent } from "./index";
import { mockRows } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardContent> = {
  title: "Dashboard/DashboardContent",
  component: DashboardContent,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardContent>;

export const Loaded: Story = {
  args: { rows: mockRows, isLoading: false },
};

export const Loading: Story = {
  args: { rows: [], isLoading: true },
};
