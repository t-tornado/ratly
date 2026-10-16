import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardContent } from ".";

const meta = {
  component: DashboardContent,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
