import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from ".";

const meta = {
  component: DataTable,
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    rows: [],
    footer: <span>0 users</span>,
  },
};

export const Loading: Story = {
  args: {
    rows: [],
    isLoading: true,
    footer: <span>Loading…</span>,
  },
};

export const Default: Story = {
  args: {
    rows: [
      { id: "usr_7c21e9", remaining: 0, total: 100, resetTime: "14:19:07", resetIn: "2m 14s", status: "exceeded", statusLabel: "Exceeded", lastRequest: "3s ago" },
      { id: "usr_3e88d1", remaining: 6, total: 100, resetTime: "14:21:07", resetIn: "4m 02s", status: "warning", statusLabel: "Warning", lastRequest: "1s ago" },
      { id: "usr_91bd47", remaining: 34, total: 125, resetTime: "14:39:03", resetIn: "22m 10s", status: "ok", statusLabel: "OK", lastRequest: "12s ago", tags: [{ label: "+25 extra", variant: "tag-info" as const }] },
      { id: "usr_5f1c30", remaining: 27, total: 100, resetTime: "14:55:13", resetIn: "38m 20s", status: "ok", statusLabel: "OK", lastRequest: "2m ago" },
    ],
    footer: (
      <>
        <span>4 users</span>
        <span>Warning ≥ 90% used · Exceeded = 100%</span>
      </>
    ),
  },
};

export const MobileCards: Story = {
  args: {
    mobileTitle: "Events",
    rows: [
      { id: "usr_7c21e9", remaining: 0, total: 100, resetTime: "14:19:07", resetIn: "2m 14s", status: "exceeded", statusLabel: "Exceeded", lastRequest: "3s ago" },
      { id: "usr_3e88d1", remaining: 6, total: 100, resetTime: "14:21:07", resetIn: "4m 02s", status: "warning", statusLabel: "Warning", lastRequest: "1s ago" },
      { id: "usr_91bd47", remaining: 34, total: 125, resetTime: "14:39:03", resetIn: "22m 10s", status: "ok", statusLabel: "OK", lastRequest: "12s ago", tags: [{ label: "+25 extra", variant: "tag-info" as const }] },
      { id: "usr_5f1c30", remaining: 27, total: 100, resetTime: "14:55:13", resetIn: "38m 20s", status: "ok", statusLabel: "OK", lastRequest: "2m ago" },
    ],
    footer: (
      <>
        <span>4 users</span>
        <span>Warning ≥ 90% used · Exceeded = 100%</span>
      </>
    ),
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
