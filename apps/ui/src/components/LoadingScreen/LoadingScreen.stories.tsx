import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingScreen } from ".";

const meta = {
  component: LoadingScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoadingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: "Connecting to server",
  },
};
