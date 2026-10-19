import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequestsTable } from ".";

const rows = [
  { time: "12:00:01", method: "GET", path: "/api/data", status: 200, xCount: "42" },
  { time: "12:00:02", method: "POST", path: "/api/submit", status: 429 },
];

describe("RequestsTable", () => {
  it("renders default title", () => {
    render(<RequestsTable rows={rows} />);
    expect(screen.getByText("Recent requests")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<RequestsTable title="API Calls" rows={rows} />);
    expect(screen.getByText("API Calls")).toBeInTheDocument();
  });

  it("renders rows with method, path, and status", () => {
    render(<RequestsTable rows={rows} />);
    expect(screen.getByText("GET /api/data")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("POST /api/submit")).toBeInTheDocument();
    expect(screen.getByText("429")).toBeInTheDocument();
  });

  it("applies error color for status >= 400", () => {
    render(<RequestsTable rows={rows} />);
    const errorCell = screen.getByText("429");
    expect(errorCell.className).toContain("text-error");
  });

  it("shows em dash when xCount missing", () => {
    render(<RequestsTable rows={rows} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows xCount when present", () => {
    render(<RequestsTable rows={rows} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
