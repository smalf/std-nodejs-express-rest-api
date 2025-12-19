const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const statusController = require('../controllers/statusController');

const router = express.Router();

router.get('/status', isAuth, statusController.getStatus);

module.exports = router;
