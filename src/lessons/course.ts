import type { Lesson } from "../lesson";
import { lesson as move } from "./01-move/lesson";
import { lesson as speed } from "./02-speed/lesson";
import { lesson as steer } from "./03-steer/lesson";
import { lesson as gravity } from "./04-gravity/lesson";
import { lesson as jump } from "./05-jump/lesson";

/** The TypeScript Course, in order. */
export const course: Lesson[] = [move, speed, steer, gravity, jump];
