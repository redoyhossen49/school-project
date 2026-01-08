import { Sparklines, SparklinesBars } from "react-sparklines";

export default function MiniGraph({
  data = [],
  color = "#2f3bbd",
  width = 60,
  height = 28,
}) {
  if (!data || data.length === 0) return null;

  return (
    <Sparklines data={data} width={width} height={height} margin={1}>
      <SparklinesBars
        style={{
          fill: color,
          fillOpacity: 0.85,
          rx: 1,
          ry: 1,
        }}
      />
    </Sparklines>
  );
}
