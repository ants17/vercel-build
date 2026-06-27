import { eveChannel } from "eve/channels/eve";
import { extractBearerToken, localDev, type AuthFn } from "eve/channels/auth";

function serviceBearer(): AuthFn<Request> {
  return (request) => {
    const expected =
      process.env.AGENT_SERVICE_BEARER_TOKEN ?? process.env.MCP_SERVICE_BEARER_TOKEN;
    if (!expected) return null;

    const token = extractBearerToken(request.headers.get("authorization"));
    if (token !== expected) return null;

    return {
      attributes: { role: "arriving-agent" },
      authenticator: "service-bearer",
      principalId: "arriving-agent",
      principalType: "service",
    };
  };
}

export default eveChannel({
  auth: [serviceBearer(), localDev()],
});
