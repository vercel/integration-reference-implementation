const fetch = require("node-fetch");
const { stringify } = require("querystring");
const responseError = require("./response-error");

module.exports = async ({
  envId,
  key,
  method,
  projectId,
  target,
  teamId,
  token,
  type,
  value,
}: {
  envId: string;
  key: string;
  method: string;
  projectId: string;
  target: string[];
  teamId: string;
  token: string;
  type: string;
  value: string;
}) => {
  const url =
    method === "POST"
      ? `https://api.vercel.com/v6/projects/${projectId}/env?teamId=${teamId}`
      : method === "PATCH"
      ? `https://api.vercel.com/v6/projects/${projectId}/env/${envId}?teamId=${teamId}`
      : `https://api.vercel.com/v4/projects/${projectId}/env/${key}?target=${target}&teamId=${teamId}`;

  console.debug("set-env", {
    envId,
    key,
    method,
    projectId,
    target,
    token,
    type,
    url,
    value,
  });
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type,
      target,
    }),
  });

  if (!res.ok) {
    console.error("Error in set-env");
    throw await responseError(res);
  }

  const body = await res.json();
  return body;
};
