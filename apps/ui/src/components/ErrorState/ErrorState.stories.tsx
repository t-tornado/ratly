import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorState } from ".";

const meta = {
  component: ErrorState,
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithRetry: Story = {
  args: {
    message: "Failed to load rate limit data.",
    onRetry: () => {},
  },
};

export const Inline: Story = {
  args: {
    title: "Failed to load",
    message: "This section encountered an error.",
    onRetry: () => {},
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};
