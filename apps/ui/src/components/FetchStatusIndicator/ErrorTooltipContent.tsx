import { Typography } from "../Typography";

function ErrorTooltipContent() {
  return (
    <div className="flex flex-col gap-1">
      <Typography variant="label" as="span" className="font-semibold text-error-text">Stale data</Typography>
      <Typography variant="label" as="span">Last update failed. Retrying in the background.</Typography>
      <Typography variant="label" as="span" className="text-text-muted">What you see may be outdated.</Typography>
    </div>
  );
}

export { ErrorTooltipContent };
