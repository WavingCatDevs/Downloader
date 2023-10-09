const { Router } = require("express");

const download = require("./spotify/download");

const router = Router();

router.post("/api/download", download);

module.exports = router;
