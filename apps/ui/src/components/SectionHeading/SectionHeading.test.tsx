import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from ".";

describe("SectionHeading", () => {
  it("renders title text", () => {
    render(<SectionHeading>Recent Activity</SectionHeading>);
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("renders as h2 element", () => {
    render(<SectionHeading>Title</SectionHeading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
