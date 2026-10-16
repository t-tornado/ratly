import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageSection } from ".";

const meta = {
  component: PageSection,
  tags: ["autodocs"],
} satisfies Meta<typeof PageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)] p-6 text-[var(--color-text-secondary)]">
        Page content goes here
      </div>
    ),
  },
};
