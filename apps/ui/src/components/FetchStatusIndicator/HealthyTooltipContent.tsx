import { Typography } from "../Typography";

function HealthyTooltipContent() {
  return (
    <div className="flex flex-col gap-1">
      <Typography variant="label" as="span" className="font-semibold text-success-text">Up to date</Typography>
      <Typography variant="label" as="span">This data refreshes automatically.</Typography>
    </div>
  );
}

export { HealthyTooltipContent };
