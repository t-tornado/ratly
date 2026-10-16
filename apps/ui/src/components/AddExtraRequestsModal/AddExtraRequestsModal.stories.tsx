import type { Meta, StoryObj } from "@storybook/react-vite";

import { AddExtraRequestsModal } from ".";

const meta = {
  component: AddExtraRequestsModal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-[var(--color-bg-base)] min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddExtraRequestsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    currentRemaining: 42,
  },
};
