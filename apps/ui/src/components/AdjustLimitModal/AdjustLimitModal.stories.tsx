import type { Meta, StoryObj } from "@storybook/react-vite";

import { AdjustLimitModal } from ".";

const meta = {
  component: AdjustLimitModal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-bg-base min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdjustLimitModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    currentLimit: 100,
    currentRemaining: 42,
  },
};

export const HighLimit: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_abc123",
    currentLimit: 1000,
    currentRemaining: 800,
  },
};

export const ConfirmLoading: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    currentLimit: 100,
    currentRemaining: 42,
    isLoading: true,
  },
};
