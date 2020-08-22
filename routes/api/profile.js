const express = require('express');
const router = express.Router();

// @route    GET api/Profile
// @desc     Get user by token
// @access   Private
router.get('/', (req, res) => res.send('Profile route'));

module.exports = router;