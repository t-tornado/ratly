import type { Meta, StoryObj } from "@storybook/react-vite";
import { Navbar } from ".";

const meta = {
  component: Navbar,
  tags: ["autodocs"],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    env: "prod",
    links: [
      { label: "Users", href: "#", active: true },
      { label: "Audit log", href: "#" },
    ],
    connected: true,
    configText: "default 100 req / hour · resets hourly per user",
  },
};
