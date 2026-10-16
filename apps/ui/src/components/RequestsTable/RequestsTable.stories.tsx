import type { Meta, StoryObj } from "@storybook/react-vite";
import { RequestsTable } from ".";

const meta = {
  component: RequestsTable,
  tags: ["autodocs"],
} satisfies Meta<typeof RequestsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rows: [
      { time: "14:16:53.212", method: "GET", path: "/v1/posts", status: 200, xCount: "6" },
      { time: "14:16:44.870", method: "POST", path: "/v1/comments", status: 201, xCount: "7" },
      { time: "14:16:31.045", method: "GET", path: "/v1/feed", status: 200, xCount: "8" },
      { time: "13:02:11.733", method: "GET", path: "/v1/feed", status: 429 },
    ],
  },
};
