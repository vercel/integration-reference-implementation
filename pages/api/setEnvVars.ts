const { parse } = require("url");
const { HOST } = require("../../lib/env");
const setEnv = require("../../lib/set-env-vars");
import { NowRequest, NowResponse } from "@vercel/node";
const getProjects = require("../../lib/get-projects");

module.exports = async (req: NowRequest, res: NowResponse) => {
  const {
    query: {
      configurationId,
      envId,
      key,
      method,
      projectId,
      target,
      teamId,
      token,
      value,
    },
  } = parse(req.url, true);
  if (!token) {
    res.statusCode = 400;
    res.end("missing query parameter: token");
    return;
  }

  const envResp = await setEnv({
    envId,
    key,
    method,
    projectId,
    target: [target],
    teamId,
    token,
    type: "plain",
    value,
  });

  // This is not efficient
  const projects = await getProjects({ configurationId, token, teamId });
  res.json({ projects, envResp });
};
