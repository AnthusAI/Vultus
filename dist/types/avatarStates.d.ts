export declare const BOT_AVATAR_STATES: readonly ["neutral", "thinking", "deepThinking", "toolCalling", "toolResponse", "speakingOpen", "speakingWide", "speakingRound", "speakingComplete"];
export type BotAvatarState = (typeof BOT_AVATAR_STATES)[number];
export declare const computeAllFacialPathsForState: (stateName: BotAvatarState) => {
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
