import type { ProceduralAvatarModel } from "./avatarModels";
export declare const BOT_AVATAR_STATES: readonly ["neutral", "thinking", "deepThinking", "toolCalling", "toolResponse", "speakingOpen", "speakingWide", "speakingRound", "speakingComplete"];
export type BotAvatarState = (typeof BOT_AVATAR_STATES)[number];
export type FacialShapeDefinition = {
    rx: number;
    ry: number;
    dy: number;
    shape: "ellipse" | "curvedLens";
    curveDirection?: "up" | "down";
};
/**
 * Shape tables for VULTUS_CLASSIC_MODEL's facial features. Exported so
 * avatarModels.ts can build the classic model from them; a different
 * procedural model supplies its own tables instead.
 */
export declare const classicEyeShapeDefinitionsByState: Record<BotAvatarState, FacialShapeDefinition>;
export declare const classicMouthShapeDefinitionsByState: Record<BotAvatarState, FacialShapeDefinition>;
/**
 * Computes facial feature paths for a model at a given state. Feature
 * anchors (where the eyes/mouth sit) and per-state shape tables both come
 * from the model, so this works for any procedural model, not just the
 * classic robot. `mouthPathString` is "" when the model has no mouth
 * feature or no shape table entry for this state.
 */
export declare const computeAllFacialPathsForState: (model: ProceduralAvatarModel, stateName: BotAvatarState) => {
    leftEyePathString: string;
    rightEyePathString: string;
    mouthPathString: string;
};
export declare const orderedStateButtonDescriptors: readonly [{
    readonly stateKey: "neutral";
    readonly buttonLabel: "Neutral";
    readonly romanNumeralIndex: "I";
}, {
    readonly stateKey: "thinking";
    readonly buttonLabel: "Thinking";
    readonly romanNumeralIndex: "II";
}, {
    readonly stateKey: "deepThinking";
    readonly buttonLabel: "Deep Thinking";
    readonly romanNumeralIndex: "III";
}, {
    readonly stateKey: "toolCalling";
    readonly buttonLabel: "Tool Calling";
    readonly romanNumeralIndex: "IV";
}, {
    readonly stateKey: "toolResponse";
    readonly buttonLabel: "Tool Response";
    readonly romanNumeralIndex: "V";
}, {
    readonly stateKey: "speakingOpen";
    readonly buttonLabel: "Speaking · Open";
    readonly romanNumeralIndex: "VI";
}, {
    readonly stateKey: "speakingWide";
    readonly buttonLabel: "Speaking · Wide";
    readonly romanNumeralIndex: "VII";
}, {
    readonly stateKey: "speakingRound";
    readonly buttonLabel: "Speaking · Round";
    readonly romanNumeralIndex: "VIII";
}, {
    readonly stateKey: "speakingComplete";
    readonly buttonLabel: "Speaking Complete";
    readonly romanNumeralIndex: "IX";
}];
export declare const automatedSpeakingPlaybackSequence: readonly [{
    readonly stateKey: "speakingOpen";
    readonly holdMilliseconds: 280;
}, {
    readonly stateKey: "speakingRound";
    readonly holdMilliseconds: 220;
}, {
    readonly stateKey: "speakingWide";
    readonly holdMilliseconds: 260;
}, {
    readonly stateKey: "speakingOpen";
    readonly holdMilliseconds: 220;
}, {
    readonly stateKey: "speakingRound";
    readonly holdMilliseconds: 200;
}, {
    readonly stateKey: "speakingWide";
    readonly holdMilliseconds: 260;
}, {
    readonly stateKey: "speakingComplete";
    readonly holdMilliseconds: 900;
}, {
    readonly stateKey: "neutral";
    readonly holdMilliseconds: 0;
}];
export declare const formatStateKeyAsReadableLabel: (stateKey: BotAvatarState) => string;
