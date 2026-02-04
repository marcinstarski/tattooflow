import { Queue } from "bullmq";
import { getRedisOptions } from "@/server/redis";

const connection = getRedisOptions();

export const reminderQueue = new Queue("reminders", { connection });
export const noReplyQueue = new Queue("no-reply", { connection });
export const depositQueue = new Queue("deposit", { connection });
export const marketingQueue = new Queue("marketing", { connection });
export const dunningQueue = new Queue("dunning", { connection });
