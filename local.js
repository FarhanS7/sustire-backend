// local.js
require("dotenv").config();
const app = require("./src/server");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
