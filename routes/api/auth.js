const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const config = require('config')
const {check, validationResult } = require('express-validator/check')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')//Encrypt psw

// @route    GET api/auth
// @desc     Get user by token
// @access   Public
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password')
        console.log(user)
        res.json(user)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server error')
    }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post('/', 
[
    check('email', 'Please include a valid email').isEmail(),
    check('password','Password is required'
    ).exists()
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {email, password } = req.body

    try {
        // Check if user exists
        let user = await User.findOne({ email })

        if (!user){
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

        // Compare User with password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }
        // Return JSON webToken
        const payLoad = {
            user: {
                id: user.id //getting userID from Db
            }  
        }
        jwt.sign(
            payLoad,
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token) => {
                if(err) throw err
                res.json({token})
                console.log(req.body)
            }
            )
        // console.log(req.body)
        // res.send('User has been registered')
    }catch (err){
        console.log(err)
    }
});


module.exports = router;