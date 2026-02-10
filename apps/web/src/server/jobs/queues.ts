import { Queue } from "bullmq";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getRedisOptions } from "@/server/redis";

type Queues = {
  reminderQueue: Queue;
  noReplyQueue: Queue;
  depositQueue: Queue;
  marketingQueue: Queue;
  dunningQueue: Queue;
};

let queues: Queues | null = null;

export function getQueues(): Queues | null {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return null;
  }
  if (!queues) {
    const connection = getRedisOptions();
    queues = {
      reminderQueue: new Queue("reminders", { connection }),
      noReplyQueue: new Queue("no-reply", { connection }),
      depositQueue: new Queue("deposit", { connection }),
      marketingQueue: new Queue("marketing", { connection }),
      dunningQueue: new Queue("dunning", { connection })
    };
  }
  return queues;
}
