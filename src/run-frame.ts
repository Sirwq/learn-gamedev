// The rules for one Run frame. Scheduling, canvas drawing and worker messages stay in the worker.
import { achievementChecker } from "./achievements";
import { checker, type CheckResult } from "./check";
import type { ConsoleLine } from "./console";
import { type Box, type CameraStart, type Clip, type GameObject, keyEvent, keysDown, labels, type Label, logs, type MonoBehaviour, releaseAllKeys, startGame, takeSounds, worldView } from "./engine";
import type { Check } from "./lesson";

export type FrameResult =
  | { objects: GameObject[]; check: CheckResult; earned: string[]; sounds: Clip[]; labels: Label[]; lines: ConsoleLine[] }
  | { error: unknown; lines: ConsoleLine[] };

export const runInput = (code: string, down: boolean) => keyEvent(code, down);
export const releaseRunKeys = () => releaseAllKeys();
export const drainRunLogs = () => logs.splice(0);

/** Starts the engine and checkers once; step returns the complete result of one frame. */
export function createRun({ level, goals, lose, classes, earned, v2 }: {
  level: { boxes: Box[]; camera?: CameraStart };
  goals: Check[];
  lose: Check[];
  classes: Record<string, new () => MonoBehaviour>;
  earned: Set<string>;
  v2: boolean;
}) {
  const game = startGame(level.boxes, classes, level.camera, v2);
  const check = checker({ goals, lose });
  const achieve = achievementChecker(level.boxes, earned);
  return {
    objects: game.objects,
    input: runInput,
    releaseKeys: releaseRunKeys,
    step(): FrameResult {
      try {
        game.step();
        const world = worldView(game.objects);
        const sounds = takeSounds();
        const result = check(world, v2 ? { keysDown: keysDown(), sounds, labels } : undefined);
        const ids = achieve(world, { logged: logs.length > 0, keysDown: keysDown() });
        return { objects: game.objects, check: result, earned: ids, sounds, labels, lines: drainRunLogs() };
      } catch (error) {
        return { error, lines: drainRunLogs() };
      }
    },
  };
}
