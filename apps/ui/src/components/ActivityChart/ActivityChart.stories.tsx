import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityChart } from ".";

const meta = {
  component: ActivityChart,
  tags: ["autodocs"],
} satisfies Meta<typeof ActivityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeRange: "hour",
    children: (
      <div className="h-40 flex items-end gap-0.5 px-2">
        {[3, 5, 2, 8, 12, 6, 4, 15, 20, 18, 7, 3].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[var(--color-accent-blue)] rounded-t-sm"
            style={{ height: `${h * 5}%` }}
          />
        ))}
      </div>
    ),
  },
};
