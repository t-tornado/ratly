import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartEmpty } from ".";

const meta = {
  component: ChartEmpty,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const NoActiveWindows: Story = {
  args: {
    message: "No active windows",
    description: "Top users will appear here once requests start flowing",
  },
};

export const NoUserActivity: Story = {
  args: {
    message: "No activity recorded",
    description: "Request activity will be charted here once this user starts making requests",
  },
};
