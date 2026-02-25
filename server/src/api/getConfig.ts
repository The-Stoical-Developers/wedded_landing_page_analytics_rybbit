import { FastifyRequest, FastifyReply } from "fastify";
import { createRequire } from "module";
import { MAPBOX_TOKEN } from "../lib/const.js";
import { getSetting } from "../services/settingsService.js";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

export async function getConfig(_: FastifyRequest, reply: FastifyReply) {
  const disableSignup = await getSetting("disableSignup");
  return reply.send({
    disableSignup,
    mapboxToken: MAPBOX_TOKEN,
  });
}

export async function getVersion(_: FastifyRequest, reply: FastifyReply) {
  return reply.send({ version });
}
