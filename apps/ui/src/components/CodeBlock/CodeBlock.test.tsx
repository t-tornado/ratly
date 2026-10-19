import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeBlock } from ".";

describe("CodeBlock", () => {
  it("renders code text", () => {
    render(<CodeBlock>const x = 42;</CodeBlock>);
    expect(screen.getByText("const x = 42;")).toBeInTheDocument();
  });
});
