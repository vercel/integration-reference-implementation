module.exports = async (res) => {
  const body = await res.json();
  const err = new Error(
    body.error_description ? body.error_description : "Internal server error"
  );
  err.res = res;
  err.body = body;
  return err;
};
