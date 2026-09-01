import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import type { BotAvatarState } from "./avatarStates";
import type { LottieAvatarModel } from "./avatarModels";

export type LottieBotAvatarProps = {
  model: LottieAvatarModel;
  state: BotAvatarState;
  size: number;
  lightColor: string;
  ariaLabel?: string;
};

const browserPrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export function LottieBotAvatar({
  model,
  state,
  size,
  lightColor,
  ariaLabel
}: LottieBotAvatarProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [reducedMotion, setReducedMotion] = useState(browserPrefersReducedMotion);
  const [animationReady, setAnimationReady] = useState(false);
  const segment = model.stateSegments[state] ?? model.fallbackSegment;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!animationReady) {
      return;
    }
    if (reducedMotion) {
      lottieRef.current?.goToAndStop(segment[0], true);
      return;
    }
    lottieRef.current?.playSegments([segment[0], segment[1]], true);
  }, [animationReady, reducedMotion, segment]);

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `Bot avatar - ${state} state - ${model.name} model`}
      data-vultus-model={model.id}
      data-vultus-renderer="lottie"
      style={{
        width: size,
        height: size,
        display: "block",
        overflow: "hidden",
        background: lightColor
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={model.animationData}
        autoplay={false}
        loop={!reducedMotion}
        onDOMLoaded={() => setAnimationReady(true)}
        aria-hidden="true"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
