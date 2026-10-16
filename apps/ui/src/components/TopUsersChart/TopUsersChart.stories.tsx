import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopUsersChart } from ".";

const meta = {
  component: TopUsersChart,
  tags: ["autodocs"],
} satisfies Meta<typeof TopUsersChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    users: [
      { id: "usr_2b6f84", requests: 140, max: 150 },
      { id: "usr_c02e7a", requests: 109, max: 150 },
      { id: "usr_7c21e9", requests: 100, max: 150 },
      { id: "usr_a4f02b", requests: 100, max: 150 },
      { id: "usr_3e88d1", requests: 94, max: 150 },
    ],
  },
};
