import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { EmptyState } from ".";

describe("EmptyState", () => {
  it("renders message text", () => {
    render(<EmptyState message="No results" />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(<EmptyState icon={Inbox} message="Empty" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render icon when omitted", () => {
    const { container } = render(<EmptyState message="Empty" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies warning variant classes", () => {
    const { container } = render(<EmptyState icon={Inbox} variant="warning" message="Warning" />);
    expect(container.innerHTML).toContain("text-warning");
  });
});
