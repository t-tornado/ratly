import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from ".";

const meta = {
  component: ProgressBar,
  tags: ["autodocs"],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ok: Story = {
  args: { value: 27, max: 100, variant: "ok" },
};

export const Warning: Story = {
  args: { value: 92, max: 100, variant: "warning" },
};

export const Exceeded: Story = {
  args: { value: 100, max: 100, variant: "exceeded" },
};

export const MediumSize: Story = {
  args: { value: 78, max: 100, variant: "exceeded", barSize: "md" },
};
