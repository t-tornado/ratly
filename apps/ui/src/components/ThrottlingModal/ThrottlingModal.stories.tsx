import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThrottlingModal } from ".";

const meta = {
  component: ThrottlingModal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-bg-base min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThrottlingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PauseThrottling: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    isThrottling: true,
  },
};

export const StartThrottling: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    isThrottling: false,
    currentRemaining: 42,
  },
};
