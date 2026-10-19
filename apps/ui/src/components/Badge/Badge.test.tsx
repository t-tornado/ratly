import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from ".";

describe("Badge", () => {
  it("renders label text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies status-ok variant classes by default", () => {
    render(<Badge>OK</Badge>);
    expect(screen.getByText("OK").className).toContain("border-accent-blue");
  });

  it("applies status-warning variant classes", () => {
    render(<Badge variant="status-warning">Warning</Badge>);
    expect(screen.getByText("Warning").className).toContain("border-warning");
  });

  it("applies status-exceeded variant classes", () => {
    render(<Badge variant="status-exceeded">Exceeded</Badge>);
    expect(screen.getByText("Exceeded").className).toContain("border-error");
  });
});
