import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { DashboardUsersTable } from ".";

const meta = {
  component: DashboardUsersTable,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof DashboardUsersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
