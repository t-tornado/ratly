import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from ".";

const meta = {
  component: CodeBlock,
  tags: ["autodocs"],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HttpOk: Story = {
  render: () => (
    <CodeBlock>
      <span className="text-[var(--color-success-text)]">HTTP/1.1 200 OK</span>
      {"\n"}x-count: 6{"\n"}content-type: application/json
    </CodeBlock>
  ),
};

export const Http429: Story = {
  render: () => (
    <CodeBlock>
      <span className="text-[var(--color-error)]">
        HTTP/1.1 429 Too Many Requests
      </span>
      {"\n"}retry-after: 134
    </CodeBlock>
  ),
};
