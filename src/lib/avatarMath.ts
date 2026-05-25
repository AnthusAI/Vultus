const QUARTER_ARC_BEZIER_HANDLE = 0.5522847498;
const SIGNED_DECIMAL_NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g;

export const buildFourSegmentEllipsePath = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): string => {
  const horizontalHandle = radiusX * QUARTER_ARC_BEZIER_HANDLE;
  const verticalHandle = radiusY * QUARTER_ARC_BEZIER_HANDLE;
  return (
    "M " +
    (centerX - radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX - radiusX) +
    " " +
    (centerY - verticalHandle) +
    " " +
    (centerX - horizontalHandle) +
    " " +
    (centerY - radiusY) +
    " " +
    centerX +
    " " +
    (centerY - radiusY) +
    " " +
    "C " +
    (centerX + horizontalHandle) +
    " " +
    (centerY - radiusY) +
    " " +
    (centerX + radiusX) +
    " " +
    (centerY - verticalHandle) +
    " " +
    (centerX + radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX + radiusX) +
    " " +
    (centerY + verticalHandle) +
    " " +
    (centerX + horizontalHandle) +
    " " +
    (centerY + radiusY) +
    " " +
    centerX +
    " " +
    (centerY + radiusY) +
    " " +
    "C " +
    (centerX - horizontalHandle) +
    " " +
    (centerY + radiusY) +
    " " +
    (centerX - radiusX) +
    " " +
    (centerY + verticalHandle) +
    " " +
    (centerX - radiusX) +
    " " +
    centerY +
    " Z"
  );
};

export const buildFourSegmentCurvedLensPath = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  curveDirection: "up" | "down"
): string => {
  const horizontalHandle = radiusX * QUARTER_ARC_BEZIER_HANDLE;
  const flatSideRatio = 0.18;
  const curvedSideRatio = 1.5;
  const dipsDownward = curveDirection === "down";
  const topOffset = dipsDownward ? radiusY * flatSideRatio : radiusY * curvedSideRatio;
  const bottomOffset = dipsDownward ? radiusY * curvedSideRatio : radiusY * flatSideRatio;
  const topY = centerY - topOffset;
  const bottomY = centerY + bottomOffset;
  const topVerticalHandle = topOffset * QUARTER_ARC_BEZIER_HANDLE;
  const bottomVerticalHandle = bottomOffset * QUARTER_ARC_BEZIER_HANDLE;
  return (
    "M " +
    (centerX - radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX - radiusX) +
    " " +
    (centerY - topVerticalHandle) +
    " " +
    (centerX - horizontalHandle) +
    " " +
    topY +
    " " +
    centerX +
    " " +
    topY +
    " " +
    "C " +
    (centerX + horizontalHandle) +
    " " +
    topY +
    " " +
    (centerX + radiusX) +
    " " +
    (centerY - topVerticalHandle) +
    " " +
    (centerX + radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX + radiusX) +
    " " +
    (centerY + bottomVerticalHandle) +
    " " +
    (centerX + horizontalHandle) +
    " " +
    bottomY +
    " " +
    centerX +
    " " +
    bottomY +
    " " +
    "C " +
    (centerX - horizontalHandle) +
    " " +
    bottomY +
    " " +
    (centerX - radiusX) +
    " " +
    (centerY + bottomVerticalHandle) +
    " " +
    (centerX - radiusX) +
    " " +
    centerY +
    " Z"
  );
};

export const interpolateNumericValuesBetweenPathStrings = (
  fromPathString: string,
  toPathString: string,
  easedProgress: number
): string => {
  const fromPathNumbers = fromPathString.match(SIGNED_DECIMAL_NUMBER_PATTERN)?.map(Number) ?? [];
  const toPathNumbers = toPathString.match(SIGNED_DECIMAL_NUMBER_PATTERN)?.map(Number) ?? [];
  let consumedNumberIndex = 0;
  return fromPathString.replace(SIGNED_DECIMAL_NUMBER_PATTERN, () => {
    const fromValue = fromPathNumbers[consumedNumberIndex] ?? 0;
    const toValue = toPathNumbers[consumedNumberIndex] ?? 0;
    const interpolatedValue = fromValue + (toValue - fromValue) * easedProgress;
    consumedNumberIndex += 1;
    return interpolatedValue.toFixed(3);
  });
};
