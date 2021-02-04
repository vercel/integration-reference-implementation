const fetch = require("node-fetch");
const { stringify } = require("querystring");
const responseError = require("./response-error");

module.exports = async ({ token, teamId }) => {
  const query = stringify({ teamId });
  const res = await fetch(`https://api.vercel.com/v4/projects?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Error in get-projects");
    throw await responseError(res);
  }

  const json = await res.json();
  return json;
};
