import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from ".";

vi.mock("../../../../lib/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(() => false),
}));

import { useMediaQuery } from "../../../../lib/hooks/useMediaQuery";

const mockedUseMediaQuery = vi.mocked(useMediaQuery);

function renderRow(userId: string) {
  return (
    <tr key={userId}>
      <td>{userId}</td>
    </tr>
  );
}

describe("DataTable", () => {
  it("renders rows in table variant (desktop)", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(<DataTable userIds={["a", "b"]} renderRow={renderRow} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(<DataTable userIds={[]} renderRow={renderRow} isLoading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows disconnected state", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(<DataTable userIds={[]} renderRow={renderRow} isDisconnected />);
    expect(screen.getByText(/connection to server lost/i)).toBeInTheDocument();
  });

  it("shows empty state when no userIds and not loading", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const { container } = render(<DataTable userIds={[]} renderRow={renderRow} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(
      <DataTable userIds={["a"]} renderRow={renderRow} footer={<span>Footer</span>} />,
    );
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders mobile variant when breakpoint matches", () => {
    mockedUseMediaQuery.mockReturnValue(true);
    render(<DataTable userIds={["a"]} renderRow={() => <div>Mobile row</div>} />);
    expect(screen.getByText("Mobile row")).toBeInTheDocument();
  });
});
