const express = require('express');
const router = express.Router();

// @route    GET api/post
// @desc     Get user by token
// @access   Private
router.get('/', (req, res) => res.send('Post route'));

module.exports = router;
