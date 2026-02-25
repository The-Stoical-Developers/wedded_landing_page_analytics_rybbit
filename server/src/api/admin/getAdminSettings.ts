import { FastifyReply, FastifyRequest } from "fastify";
import { getAllSettings } from "../../services/settingsService.js";

export async function getAdminSettings(_request: FastifyRequest, reply: FastifyReply) {
  const settings = await getAllSettings();
  return reply.status(200).send(settings);
}
