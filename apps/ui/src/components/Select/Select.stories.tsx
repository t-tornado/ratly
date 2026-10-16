import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from ".";

const meta = {
  component: Select,
  tags: ["autodocs"],
  render: (args) => (
    <Select {...args}>
      <option value="any">any time</option>
      <option value="15m">last 15 min</option>
      <option value="1h">last hour</option>
      <option value="24h">last 24 h</option>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Time range",
  },
};
