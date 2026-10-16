import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHeading } from ".";

const meta = {
  component: SectionHeading,
  tags: ["autodocs"],
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Top users · current window" },
};
