import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FetchStatusIndicator } from ".";

describe("FetchStatusIndicator", () => {
  it("renders healthy state", () => {
    const { container } = render(<FetchStatusIndicator isError={false} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.innerHTML).toContain("text-success");
  });

  it("renders error state", () => {
    const { container } = render(<FetchStatusIndicator isError={true} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.innerHTML).toContain("text-error");
  });
});
