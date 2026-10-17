import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import App from "./App";

const meta = {
  component: App,
  parameters: { skipRouter: true },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await waitFor(
      () => expect(canvas.getByText("ratly")).toBeVisible(),
      { timeout: 10000 },
    );
  },
};
