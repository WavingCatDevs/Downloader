const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const router = require("./routes");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(router);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
