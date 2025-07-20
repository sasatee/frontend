// @ts-ignore
import { ChartConfig, THEMES } from '../../lib/chartUtils';

export const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  // @ts-ignore
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  // @ts-ignore
  .map(([key, itemConfig]) => {
    // @ts-ignore
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};
