"use client";

import type { CSSProperties } from "react";

import { spiralInwardNormFromIndex, spiralInwardOrderValue, DotMatrixWrapper } from "#lib/dotmatrix-core";
import type { DotAnimationResolver, DotMatrixCommonProps } from "#lib/dotmatrix-core";

export type DotmSquare3Props = DotMatrixCommonProps;

const animationResolver: DotAnimationResolver = ({ isActive, index, reducedMotion, phase }) => {
  if (!isActive) {
    return { className: "dmx-inactive" };
  }

  const order = spiralInwardOrderValue(index);
  const pathNorm = spiralInwardNormFromIndex(index);
  const style = { "--dmx-spiral-order": order } as CSSProperties;

  if (reducedMotion || phase === "idle") {
    return {
      style: {
        ...style,
        opacity: 0.16 + pathNorm * 0.78
      }
    };
  }

  return { className: "dmx-spiral-snake", style };
};

export function DotmSquare3(props: DotmSquare3Props) {
  return (
    <DotMatrixWrapper
      {...props}
      animationResolver={animationResolver}
    />
  );
}
