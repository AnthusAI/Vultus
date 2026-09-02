import type { CharacterSpec } from "./characterModels";
import type { ProceduralAvatarModel } from "./avatarModels";
import type { CreativeRole } from "./creativeDeskModels";
export declare function creativeCharacterSpecForRole(role: CreativeRole): CharacterSpec;
export declare function creativeCharacterModelForRole(role: CreativeRole): ProceduralAvatarModel;
