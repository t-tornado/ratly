import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardContent } from "./index";
import { mockRows, createMockRowEventStore } from "../../../../test/fixtures";

const meta: Meta<typeof DashboardContent> = {
  title: "Dashboard/DashboardContent",
  component: DashboardContent,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DashboardContent>;

export const Loaded: Story = {
  args: { store: createMockRowEventStore(mockRows), isLoading: false, isConnected: true },
};

export const Loading: Story = {
  args: { store: createMockRowEventStore([]), isLoading: true, isConnected: true },
};

export const Disconnected: Story = {
  args: { store: createMockRowEventStore(mockRows), isLoading: false, isConnected: false },
};
