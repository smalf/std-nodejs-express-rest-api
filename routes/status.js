const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const accController = require('../controllers/accController');

const router = express.Router();

router.get('/status', isAuth, accController.getStatus);
router.put('/status', isAuth,
    [
        body('status',
            'Status should include at list 5 characters.')
            .trim()
            .isLength({ min: 5 }),
        
    ], accController.updateStatus);

module.exports = router;
