import { Suite } from "benchmark";
import { createAdapter } from "./original";
import { createAdapter as createAdapterLock } from "./index";
import { createAdapter as createAdapterSlice } from "./slice-version";
import { runEffects } from "@most/core";
import { newDefaultScheduler } from "@most/scheduler";

const suite = new Suite();
const scheduler = newDefaultScheduler();

const addSuite = (count: number) => {
  const [induce, events] = createAdapter();
  const [lockInduce, lockEvents] = createAdapterLock();
  const [sliceInduce, sliceEvents] = createAdapterSlice();

  for (let i = 0; i < count; i++) {
    runEffects(events, scheduler);
    runEffects(lockEvents, scheduler);
    runEffects(sliceEvents, scheduler);
  }

  suite
    .add(`slice version - ${count} sinks`, () => {
      sliceInduce(undefined);
    })
    .add(`lock version - ${count} sinks`, () => {
      lockInduce(undefined);
    })
    .add(`original version - ${count} sinks`, () => {
      induce(undefined);
    });
};

for (let i = 1; i <= 8; i = i * 2) addSuite(i);

suite
  .on("cycle", (event: Event) => {
    console.log(String(event.target));
  })
  // run async
  .run({ async: true });
