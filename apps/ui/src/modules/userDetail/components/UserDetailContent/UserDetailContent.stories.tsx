import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDetailContent } from ".";

const meta = {
  component: UserDetailContent,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="dark bg-bg-base text-text-primary p-7 min-h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserDetailContent>;

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
