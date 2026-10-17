import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from ".";

const meta: Meta<typeof Typography> = {
  title: "Components/Typography",
  component: Typography,
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Typography variant="h1" as="h1">Heading 1 — text-5xl semibold</Typography>
      <Typography variant="h2" as="h2">Heading 2 — text-3xl semibold mono</Typography>
      <Typography variant="h3" as="h3">Heading 3 — text-2xl semibold</Typography>
      <Typography variant="body">Body — text-base-sm</Typography>
      <Typography variant="bodySm">Body Small — text-base-sm leading-normal</Typography>
      <Typography variant="label" as="span">Label — text-sm</Typography>
      <Typography variant="labelSm" as="span">Label Small — text-xs</Typography>
      <Typography variant="caption" as="span">Caption — text-sm medium uppercase tracking-wider</Typography>
      <Typography variant="tableHeader" as="span">Table Header — text-sm uppercase tracking-wide</Typography>
      <Typography variant="code" as="code">Code — text-sm mono leading-relaxed</Typography>
      <Typography variant="mono" as="span">Mono — text-base-sm mono</Typography>
      <Typography variant="value" as="span">1,284</Typography>
    </div>
  ),
};

export const WithColors: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Typography variant="h1" className="text-text-primary">Primary heading</Typography>
      <Typography variant="body" className="text-text-secondary">Secondary body text</Typography>
      <Typography variant="label" as="span" className="text-text-muted">Muted label</Typography>
      <Typography variant="label" as="span" className="text-success-text">Success label</Typography>
      <Typography variant="label" as="span" className="text-error-text">Error label</Typography>
      <Typography variant="label" as="span" className="text-warning-text">Warning label</Typography>
    </div>
  ),
};
