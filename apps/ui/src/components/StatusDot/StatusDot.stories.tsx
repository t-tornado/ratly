import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusDot } from ".";

const meta = {
  component: StatusDot,
  tags: ["autodocs"],
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {
  args: { variant: "live" },
};

export const LivePulsating: Story = {
  args: { variant: "live", pulsating: true },
};

export const Warning: Story = {
  args: { variant: "warning" },
};
