const AuthMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  // Extract the credentials from the Authorization header
  const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString(
    "utf-8"
  );
  console.log(credentials);

  // Split the credentials into username and password
  const [username, password] = credentials.split(":");

  if (username === "admin" && password === "P4ssword") {
    req.isAdminAuthenticated = true;
    next();
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
};

module.exports = AuthMiddleware;
