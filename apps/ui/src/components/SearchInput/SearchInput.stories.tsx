import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchInput } from ".";

const meta = {
  component: SearchInput,
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Search user ID…" },
};
