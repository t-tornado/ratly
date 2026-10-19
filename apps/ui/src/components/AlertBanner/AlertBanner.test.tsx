import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlertBanner } from ".";

describe("AlertBanner", () => {
  it("renders message", () => {
    render(<AlertBanner message="Rate limit exceeded" />);
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const handleClick = vi.fn();
    render(<AlertBanner message="Error" action={{ label: "Retry", onClick: handleClick }} />);
    const button = screen.getByRole("button", { name: "Retry" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not render button when action omitted", () => {
    render(<AlertBanner message="Info" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
