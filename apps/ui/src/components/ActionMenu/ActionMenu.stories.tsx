import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionMenu } from ".";

const meta = {
  component: ActionMenu,
  tags: ["autodocs"],
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Reset window", onClick: () => {} },
      { label: "Add extra requests", onClick: () => {} },
      { label: "Adjust limit", onClick: () => {} },
      { label: "Pause throttling", onClick: () => {} },
    ],
  },
};

export const WithHiddenItem: Story = {
  args: {
    items: [
      { label: "Reset window", onClick: () => {} },
      { label: "Add extra requests", onClick: () => {} },
      { label: "Adjust limit", onClick: () => {} },
      { label: "Reset to default", onClick: () => {}, hidden: true },
      { label: "Pause throttling", onClick: () => {} },
    ],
  },
};
