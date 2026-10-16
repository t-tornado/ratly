import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from ".";

const meta = {
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  args: { children: "Cancel", variant: "ghost" },
};

export const Primary: Story = {
  args: { children: "Pause throttling", variant: "primary" },
};

export const DestructiveGhost: Story = {
  args: { children: "Reset window", variant: "destructive-ghost" },
};

export const WarningGhost: Story = {
  args: { children: "Retry now", variant: "warning-ghost" },
};

export const Filter: Story = {
  args: { children: "OK 5", variant: "filter" },
};

export const FilterActive: Story = {
  args: { children: "All 10", variant: "filter-active" },
};

export const IconOnly: Story = {
  args: { children: "⋯", variant: "icon-only", size: "icon" },
};
