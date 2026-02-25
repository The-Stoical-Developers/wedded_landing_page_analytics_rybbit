import { FastifyReply, FastifyRequest } from "fastify";
import { updateSetting } from "../../services/settingsService.js";

const ALLOWED_KEYS: Record<string, "boolean"> = {
  disableSignup: "boolean",
};

export async function updateAdminSettings(
  request: FastifyRequest<{ Body: { key: string; value: any } }>,
  reply: FastifyReply
) {
  const { key, value } = request.body;

  if (!key || value === undefined) {
    return reply.status(400).send({ error: "key and value are required" });
  }

  const expectedType = ALLOWED_KEYS[key];
  if (!expectedType) {
    return reply.status(400).send({ error: `Setting "${key}" is not a valid setting` });
  }

  if (typeof value !== expectedType) {
    return reply.status(400).send({ error: `Setting "${key}" must be of type ${expectedType}` });
  }

  const userId = (request as any).user?.id;
  await updateSetting(key, value, userId);

  return reply.status(200).send({ success: true });
}
