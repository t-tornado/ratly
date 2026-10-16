import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from ".";

const meta = {
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusOk: Story = {
  args: { children: "OK", variant: "status-ok" },
};

export const StatusWarning: Story = {
  args: { children: "Warning", variant: "status-warning" },
};

export const StatusExceeded: Story = {
  args: { children: "Exceeded", variant: "status-exceeded" },
};

export const TagInfo: Story = {
  args: { children: "+25 extra", variant: "tag-info" },
};

export const TagWarning: Story = {
  args: { children: "paused 45m", variant: "tag-warning" },
};

export const TagPurple: Story = {
  args: { children: "limit 150", variant: "tag-purple" },
};

export const Env: Story = {
  args: { children: "prod", variant: "env" },
};
