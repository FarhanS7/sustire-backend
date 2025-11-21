// api/index.js
require("dotenv").config();
const serverless = require("serverless-http");
const app = require("../src/server"); // raw Express app

module.exports.handler = serverless(app); // for Vercel
