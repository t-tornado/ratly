import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryRow } from ".";

describe("SummaryRow", () => {
  it("maps items to StatCards", () => {
    render(
      <SummaryRow
        items={[
          { label: "Endpoint", value: "/api/v1" },
          { label: "Method", value: "POST", sub: "via proxy" },
        ]}
      />,
    );
    expect(screen.getByText("Endpoint")).toBeInTheDocument();
    expect(screen.getByText("/api/v1")).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("via proxy")).toBeInTheDocument();
  });
});
