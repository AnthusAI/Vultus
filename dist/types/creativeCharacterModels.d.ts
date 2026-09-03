import type { CharacterSpec } from "./characterModels";
import type { ProceduralAvatarModel } from "./avatarModels";
export type CreativeCharacterRole = "Editor" | "Reporter" | "Copy Writer" | "Illustrator" | "Producer" | "Researcher" | "Archivist" | "Analyst";
export declare function creativeCharacterSpecForRole(role: CreativeCharacterRole): CharacterSpec;
export declare function creativeCharacterModelForRole(role: CreativeCharacterRole): ProceduralAvatarModel;
