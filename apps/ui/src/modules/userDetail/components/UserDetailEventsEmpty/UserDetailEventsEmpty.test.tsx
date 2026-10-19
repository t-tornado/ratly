import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailEventsEmpty } from ".";

describe("UserDetailEventsEmpty", () => {
  it("renders empty state message", () => {
    render(<UserDetailEventsEmpty />);
    expect(screen.getByText("No events yet")).toBeInTheDocument();
  });

  it("renders icon", () => {
    const { container } = render(<UserDetailEventsEmpty />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
