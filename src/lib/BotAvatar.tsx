import { useEffect, useId, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import { buildFourSegmentEllipsePath, interpolateNumericValuesBetweenPathStrings } from "./avatarMath";
import { BOT_AVATAR_STATES, BotAvatarState, computeAllFacialPathsForState } from "./avatarStates";

const DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME = "dimgray";
const DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME = "white";

export type BotAvatarProps = {
  state?: BotAvatarState;
  size?: number;
  transitionDurationSeconds?: number;
  shadowColor?: string;
  lightColor?: string;
  ariaLabel?: string;
};

type AnimationContext = {
  leftEyePathElementRef: RefObject<SVGPathElement>;
  rightEyePathElementRef: RefObject<SVGPathElement>;
  mouthPathElementRef: RefObject<SVGPathElement>;
  antennaCircleElementRef: RefObject<SVGCircleElement>;
  innerHeadGroupElementRef: RefObject<SVGGElement>;
};

type Killable = {
  kill: () => void;
};

const ellipsePathAtPosition = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): string => buildFourSegmentEllipsePath(centerX, centerY, radiusX, radiusY);

const buildNeutralBlinkIdleAnimation = (animationContext: AnimationContext): gsap.core.Timeline => {
  const basePaths = computeAllFacialPathsForState("neutral");
  const closedLeftEyePath = ellipsePathAtPosition(70, 90, 13, 1.5);
  const closedRightEyePath = ellipsePathAtPosition(130, 90, 13, 1.5);
  const blinkTimeline = gsap.timeline({ repeat: -1, repeatDelay: 3.2 });
  const blinkProgress = { value: 0 };

  const renderBlinkAtCurrentProgress = () => {
    const p = blinkProgress.value;
    animationContext.leftEyePathElementRef.current?.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(basePaths.leftEyePathString, closedLeftEyePath, p)
    );
    animationContext.rightEyePathElementRef.current?.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(basePaths.rightEyePathString, closedRightEyePath, p)
    );
  };

  blinkTimeline.to(blinkProgress, {
    value: 1,
    duration: 0.1,
    ease: "power2.in",
    onUpdate: renderBlinkAtCurrentProgress
  });
  blinkTimeline.to(blinkProgress, {
    value: 0,
    duration: 0.16,
    ease: "power2.out",
    onUpdate: renderBlinkAtCurrentProgress
  });
  return blinkTimeline;
};

const buildEyeWanderIdleAnimation = (
  animationContext: AnimationContext,
  wanderEyeCenterPositions: ReadonlyArray<{
    leftEyeCenter: readonly [number, number];
    rightEyeCenter: readonly [number, number];
  }>,
  transitionDuration: number,
  restDurationFunction: (index: number) => number
): gsap.core.Timeline => {
  const wanderRadius = 14;
  const positionPathSets = wanderEyeCenterPositions.map((position) => ({
    leftEyePath: ellipsePathAtPosition(position.leftEyeCenter[0], position.leftEyeCenter[1], wanderRadius, wanderRadius),
    rightEyePath: ellipsePathAtPosition(
      position.rightEyeCenter[0],
      position.rightEyeCenter[1],
      wanderRadius,
      wanderRadius
    )
  }));
  const wanderTimeline = gsap.timeline({ repeat: -1 });

  for (let positionIndex = 0; positionIndex < positionPathSets.length; positionIndex += 1) {
    const fromPathSet = positionPathSets[positionIndex];
    const toPathSet = positionPathSets[(positionIndex + 1) % positionPathSets.length];
    const stepProgress = { value: 0 };
    wanderTimeline.to(stepProgress, {
      value: 1,
      duration: transitionDuration,
      ease: "power2.inOut",
      onUpdate: () => {
        const p = stepProgress.value;
        animationContext.leftEyePathElementRef.current?.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(fromPathSet.leftEyePath, toPathSet.leftEyePath, p)
        );
        animationContext.rightEyePathElementRef.current?.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(fromPathSet.rightEyePath, toPathSet.rightEyePath, p)
        );
      }
    });
    wanderTimeline.to({}, { duration: restDurationFunction(positionIndex) });
  }

  return wanderTimeline;
};

const buildThinkingWanderIdleAnimation = (animationContext: AnimationContext): gsap.core.Timeline =>
  buildEyeWanderIdleAnimation(
    animationContext,
    [
      { leftEyeCenter: [70, 86], rightEyeCenter: [130, 86] },
      { leftEyeCenter: [66, 84], rightEyeCenter: [126, 84] },
      { leftEyeCenter: [70, 82], rightEyeCenter: [130, 82] },
      { leftEyeCenter: [74, 84], rightEyeCenter: [134, 84] }
    ],
    0.5,
    () => 1.1 + Math.random() * 0.6
  );

const buildToolResponseReadingIdleAnimation = (animationContext: AnimationContext): gsap.core.Timeline =>
  buildEyeWanderIdleAnimation(
    animationContext,
    [
      { leftEyeCenter: [66, 90], rightEyeCenter: [126, 90] },
      { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] },
      { leftEyeCenter: [74, 90], rightEyeCenter: [134, 90] },
      { leftEyeCenter: [70, 90], rightEyeCenter: [130, 90] }
    ],
    0.16,
    () => 0.35
  );

const buildSimpleTransformIdleAnimation = (
  targetElement: SVGElement | null,
  tweenProperties: gsap.TweenVars
): Killable => {
  if (!targetElement) {
    return { kill: () => undefined };
  }
  const animationTween = gsap.to(targetElement, tweenProperties);
  return {
    kill: () => {
      animationTween.kill();
      gsap.set(targetElement, { clearProps: "transform" });
    }
  };
};

const buildDeepThinkingBreathingIdleAnimation = (animationContext: AnimationContext): Killable =>
  buildSimpleTransformIdleAnimation(animationContext.innerHeadGroupElementRef.current, {
    scale: 1.025,
    transformOrigin: "100px 100px",
    duration: 2.6,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

const buildToolCallingAntennaPulseIdleAnimation = (animationContext: AnimationContext): Killable =>
  buildSimpleTransformIdleAnimation(animationContext.antennaCircleElementRef.current, {
    scale: 1.45,
    transformOrigin: "100px 20px",
    duration: 0.42,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

const buildSpeakingCompleteHappyBounceIdleAnimation = (animationContext: AnimationContext): Killable =>
  buildSimpleTransformIdleAnimation(animationContext.innerHeadGroupElementRef.current, {
    y: -2,
    duration: 0.7,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

const buildSpeakingVariantPulseIdleAnimation = (
  animationContext: AnimationContext,
  primaryStateKey: BotAvatarState,
  secondaryStateKey: BotAvatarState
): gsap.core.Tween => {
  const primaryMouthPathString = computeAllFacialPathsForState(primaryStateKey).mouthPathString;
  const secondaryMouthPathString = computeAllFacialPathsForState(secondaryStateKey).mouthPathString;
  const pulseProgress = { value: 0 };
  return gsap.to(pulseProgress, {
    value: 1,
    duration: 0.18,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      animationContext.mouthPathElementRef.current?.setAttribute(
        "d",
        interpolateNumericValuesBetweenPathStrings(primaryMouthPathString, secondaryMouthPathString, pulseProgress.value)
      );
    }
  });
};

const idleAnimationBuildersByStateKey: Record<BotAvatarState, (ctx: AnimationContext) => Killable> = {
  neutral: (ctx) => buildNeutralBlinkIdleAnimation(ctx),
  thinking: (ctx) => buildThinkingWanderIdleAnimation(ctx),
  deepThinking: (ctx) => buildDeepThinkingBreathingIdleAnimation(ctx),
  toolCalling: (ctx) => buildToolCallingAntennaPulseIdleAnimation(ctx),
  toolResponse: (ctx) => buildToolResponseReadingIdleAnimation(ctx),
  speakingOpen: (ctx) => buildSpeakingVariantPulseIdleAnimation(ctx, "speakingOpen", "speakingRound"),
  speakingWide: (ctx) => buildSpeakingVariantPulseIdleAnimation(ctx, "speakingWide", "speakingOpen"),
  speakingRound: (ctx) => buildSpeakingVariantPulseIdleAnimation(ctx, "speakingRound", "speakingWide"),
  speakingComplete: (ctx) => buildSpeakingCompleteHappyBounceIdleAnimation(ctx)
};

const isBotAvatarState = (value: string): value is BotAvatarState =>
  BOT_AVATAR_STATES.includes(value as BotAvatarState);

export const BotAvatar = ({
  state = "neutral",
  size = 240,
  transitionDurationSeconds = 0.55,
  shadowColor = DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME,
  lightColor = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  ariaLabel
}: BotAvatarProps) => {
  const currentState: BotAvatarState = isBotAvatarState(state) ? state : "neutral";
  const generatedRawId = useId();
  const headClipPathId = `bot-avatar-head-clip-${generatedRawId.replace(/:/g, "")}`;

  const leftEyePathElementRef = useRef<SVGPathElement>(null);
  const rightEyePathElementRef = useRef<SVGPathElement>(null);
  const mouthPathElementRef = useRef<SVGPathElement>(null);
  const antennaCircleElementRef = useRef<SVGCircleElement>(null);
  const innerHeadGroupElementRef = useRef<SVGGElement>(null);
  const activeMorphTweenRef = useRef<Killable | null>(null);
  const activeIdleAnimationRef = useRef<Killable | null>(null);
  const initialPathSetRef = useRef(computeAllFacialPathsForState(currentState));

  useEffect(() => {
    const animationContext: AnimationContext = {
      leftEyePathElementRef,
      rightEyePathElementRef,
      mouthPathElementRef,
      antennaCircleElementRef,
      innerHeadGroupElementRef
    };

    if (
      !animationContext.leftEyePathElementRef.current ||
      !animationContext.rightEyePathElementRef.current ||
      !animationContext.mouthPathElementRef.current
    ) {
      return undefined;
    }

    activeMorphTweenRef.current?.kill();
    activeIdleAnimationRef.current?.kill();

    if (animationContext.innerHeadGroupElementRef.current) {
      gsap.set(animationContext.innerHeadGroupElementRef.current, { clearProps: "transform" });
    }
    if (animationContext.antennaCircleElementRef.current) {
      gsap.set(animationContext.antennaCircleElementRef.current, { clearProps: "transform" });
    }

    const currentlyRenderedPaths = {
      leftEyePathString: animationContext.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: animationContext.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: animationContext.mouthPathElementRef.current.getAttribute("d") ?? ""
    };

    const targetPathsForNextState = computeAllFacialPathsForState(currentState);

    const startIdleAnimationForCurrentState = () => {
      const idleBuilder = idleAnimationBuildersByStateKey[currentState];
      activeIdleAnimationRef.current = idleBuilder(animationContext);
    };

    const allFacialPathsAlreadyMatchTarget =
      currentlyRenderedPaths.leftEyePathString === targetPathsForNextState.leftEyePathString &&
      currentlyRenderedPaths.rightEyePathString === targetPathsForNextState.rightEyePathString &&
      currentlyRenderedPaths.mouthPathString === targetPathsForNextState.mouthPathString;

    if (allFacialPathsAlreadyMatchTarget) {
      startIdleAnimationForCurrentState();
    } else {
      const morphProgressContainer = { easedProgress: 0 };
      activeMorphTweenRef.current = gsap.to(morphProgressContainer, {
        easedProgress: 1,
        duration: transitionDurationSeconds,
        ease: "power3.inOut",
        onUpdate: () => {
          const progress = morphProgressContainer.easedProgress;
          animationContext.leftEyePathElementRef.current?.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              currentlyRenderedPaths.leftEyePathString,
              targetPathsForNextState.leftEyePathString,
              progress
            )
          );
          animationContext.rightEyePathElementRef.current?.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              currentlyRenderedPaths.rightEyePathString,
              targetPathsForNextState.rightEyePathString,
              progress
            )
          );
          animationContext.mouthPathElementRef.current?.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              currentlyRenderedPaths.mouthPathString,
              targetPathsForNextState.mouthPathString,
              progress
            )
          );
        },
        onComplete: startIdleAnimationForCurrentState
      });
    }

    return () => {
      activeMorphTweenRef.current?.kill();
      activeIdleAnimationRef.current?.kill();
    };
  }, [currentState, transitionDurationSeconds]);

  const initialPaths = initialPathSetRef.current;
  const computedAriaLabel = ariaLabel ?? `Bot avatar - ${currentState} state`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={computedAriaLabel}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={headClipPathId}>
          <circle cx={100} cy={100} r={90} />
        </clipPath>
      </defs>
      <rect width={200} height={200} fill={lightColor} />
      <g ref={innerHeadGroupElementRef}>
        <circle cx={100} cy={100} r={90} fill={shadowColor} />
        <g clipPath={`url(#${headClipPathId})`}>
          <circle ref={antennaCircleElementRef} cx={100} cy={20} r={10} fill={lightColor} />
          <rect x={95} y={25} width={10} height={25} fill={lightColor} />
          <rect x={15} y={80} width={30} height={40} rx={8} fill={lightColor} />
          <rect x={155} y={80} width={30} height={40} rx={8} fill={lightColor} />
          <rect x={35} y={45} width={130} height={100} rx={30} fill={lightColor} />
          <rect x={80} y={140} width={40} height={20} fill={lightColor} />
          <path d="M 20 200 Q 100 150 180 200 Z" fill={lightColor} />
          <path ref={leftEyePathElementRef} d={initialPaths.leftEyePathString} fill={shadowColor} />
          <path ref={rightEyePathElementRef} d={initialPaths.rightEyePathString} fill={shadowColor} />
          <path ref={mouthPathElementRef} d={initialPaths.mouthPathString} fill={shadowColor} />
        </g>
      </g>
    </svg>
  );
};
