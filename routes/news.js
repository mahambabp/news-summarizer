const express = require("express");
const { getSummarizedArticles } = require("../controllers/newsController");
const router = express.Router();

// Handle category as a URL parameter
router.get("/:category?", getSummarizedArticles);

module.exports = router;
