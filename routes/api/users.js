const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')//avatar pic
const bcrypt = require('bcryptjs')//Encrypt psw
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult } = require('express-validator/check')
// Importing user
const User = require('../../models/User')

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post('/', 
[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {name, email, password } = req.body

    try {
        // Check if user exists
        let user = await User.findOne({ email })

        if (user){
            return res.status(400).json({ errors: [{ msg: 'User already exist' }] })
        }
        // get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User ({
            name,
            email,
            avatar,
            password
        })
        // Encrypt password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password,salt)
        await user.save()//save user to DB
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
