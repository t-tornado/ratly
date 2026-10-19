import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from ".";

describe("Tooltip", () => {
  it("content hidden by default", () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("shows content on trigger hover", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    fireEvent.focus(screen.getByText("Hover me"));
    await waitFor(() => expect(screen.getByText("Tooltip text")).toBeInTheDocument());
  });
});
