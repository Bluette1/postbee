require("dotenv").config();

const fs = require("fs");
const path = require("path");

const envFilePath = path.join(
  __dirname,
  "src/environments/environment.production.ts"
);

let content = fs.readFileSync(envFilePath, "utf8");

content = content
  .replace("YOUR_ACCESS_KEY_ID", process.env.AWS_ACCESS_PUBLIC_KEY)
  .replace("YOUR_SECRET_ACCESS_KEY", process.env.AWS_SECRET_PRIVATE_KEY);

fs.writeFileSync(envFilePath, content, "utf8");
