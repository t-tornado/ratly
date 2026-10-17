import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Typography, type TypographyProps } from ".";

describe("Typography", () => {
  it("renders each variant without crashing", () => {
    const variants = [
      "h1", "h2", "h3", "body", "bodySm",
      "label", "labelSm", "caption", "tableHeader",
      "code", "mono", "value",
    ] as const;

    for (const variant of variants) {
      const { unmount } = render(
        <Typography variant={variant}>{variant}</Typography>,
      );
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("applies correct element via as prop", () => {
    render(<Typography as="h1" variant="h1">Title</Typography>);
    expect(screen.getByText("Title").tagName).toBe("H1");
  });

  it("defaults to p element", () => {
    render(<Typography>Default</Typography>);
    expect(screen.getByText("Default").tagName).toBe("P");
  });

  it("defaults to body variant", () => {
    render(<Typography>Body text</Typography>);
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("passes className through for color overrides", () => {
    render(
      <Typography className="text-text-muted">Muted</Typography>,
    );
    expect(screen.getByText("Muted").className).toContain("text-text-muted");
  });

  it("exports TypographyProps type", () => {
    const props: TypographyProps = { variant: "label", children: "test" };
    expect(props.variant).toBe("label");
  });
});
