import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from ".";

const meta = {
  component: Icon,
  tags: ["autodocs"],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActivityPulse: Story = {
  args: { variant: "activity-pulse", size: 22 },
};

export const Search: Story = {
  args: { variant: "search", size: 28 },
};

export const AlertCircle: Story = {
  args: { variant: "alert-circle", size: 18 },
};
