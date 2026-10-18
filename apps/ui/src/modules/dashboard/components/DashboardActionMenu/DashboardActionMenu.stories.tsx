import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardActionMenu } from ".";
import { mockUserRow, mockPausedRow, mockCustomLimitRow } from "../../../../test/fixtures";

const NOOP_CALLBACKS = {
  onClose: () => {},
  onResetWindow: () => {},
  onAddExtra: () => {},
  onAdjustLimit: () => {},
  onResetLimit: () => {},
  onPause: () => {},
  onUnlock: () => {},
};

const meta: Meta<typeof DashboardActionMenu> = {
  title: "Dashboard/DashboardActionMenu",
  component: DashboardActionMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DashboardActionMenu>;

export const NormalRow: Story = {
  args: { row: mockUserRow, ...NOOP_CALLBACKS },
};

export const PausedRow: Story = {
  args: { row: mockPausedRow, ...NOOP_CALLBACKS },
};

export const CustomLimitRow: Story = {
  args: { row: mockCustomLimitRow, ...NOOP_CALLBACKS },
};
