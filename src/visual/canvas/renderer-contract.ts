import type { QualityProfile } from "../quality/quality-contract";
import type { SceneId } from "../state/scene-contract";

export interface VisualCanvasProps {
  readonly qualityProfile: QualityProfile;
  readonly activeSceneId?: SceneId;
  readonly className?: string;
  readonly onReady?: () => void;
  readonly onError?: (error: Error) => void;
}
