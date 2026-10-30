import type { Lesson } from "../lesson";
import { lesson as move } from "./01-move/lesson";
import { lesson as speed } from "./02-speed/lesson";
import { lesson as steer } from "./03-steer/lesson";
import { lesson as gravity } from "./04-gravity/lesson";
import { lesson as jump } from "./05-jump/lesson";
import { lesson as land } from "./06-land/lesson";
import { lesson as platforms } from "./07-platforms/lesson";
import { lesson as walls } from "./08-walls/lesson";
import { lesson as camera } from "./09-camera/lesson";
import { lesson as coins } from "./10-coins/lesson";
import { lesson as enemy } from "./11-enemy/lesson";
import { lesson as stomp } from "./12-stomp/lesson";
import { lesson as shoot } from "./13-shoot/lesson";
import { lesson as health } from "./14-health/lesson";
import { lesson as moving } from "./15-moving/lesson";
import { lesson as sounds } from "./16-sounds/lesson";
import { lesson as coinCounter } from "./17-coin-counter/lesson";
import { lesson as shortLong } from "./18-short-long/lesson";
import { lesson as coyote } from "./19-coyote/lesson";

/** The TypeScript Course, in order. */
export const course: Lesson[] = [move, speed, steer, gravity, jump, land, platforms, walls, camera, coins, enemy, stomp, shoot, health, moving, sounds, coinCounter, shortLong, coyote];
