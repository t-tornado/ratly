import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResetWindowModal } from ".";

const meta = {
  component: ResetWindowModal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-bg-base min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResetWindowModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    currentRemaining: 42,
    currentStatus: "OK",
    limit: 100,
  },
};

export const ConfirmLoading: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    userId: "usr_3e88d1",
    currentRemaining: 42,
    currentStatus: "OK",
    limit: 100,
    isLoading: true,
  },
};
