const express = require("express");
const { findAll,findById, isUserInTable, getLastHistory } = require("../controllers/tablesController");
const router = express.Router();

router.get("/tables", findAll);
router.get("/tables/:id", findById);
router.get("/table/:id/last", getLastHistory);
router.get("/tables/in-table/:userId", isUserInTable);

module.exports = router;