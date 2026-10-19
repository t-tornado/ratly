import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from ".";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Users" value="42" />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders sub text when provided", () => {
    render(<StatCard label="Users" value="42" sub="of 100" />);
    expect(screen.getByText("of 100")).toBeInTheDocument();
  });

  it("does not render sub text when omitted", () => {
    const { container } = render(<StatCard label="Users" value="42" />);
    expect(container.textContent).not.toContain("of");
  });

  it("applies accent color class for error", () => {
    const { container } = render(<StatCard label="Rejected" value="10" accent="error" />);
    expect(container.innerHTML).toContain("text-error");
  });

  it("applies accent color class for warning", () => {
    const { container } = render(<StatCard label="Remaining" value="5" accent="warning" />);
    expect(container.innerHTML).toContain("text-warning");
  });
});
