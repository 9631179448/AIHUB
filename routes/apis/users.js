const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {
    check,
    validationResult
} = require('express-validator');
const User = require('../../models/User');




//routes Post api/user
//@desc  register/test routes
//@access public
router.post('/',
    [
        check('name', 'Name is required').not()
        .isEmpty(),
        check('email', 'email  is required').isEmail(),
        check('password', 'enter is your password').isLength({
            min: 6
        })
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            name,
            email,
            password
        } = req.body;
        try {
            // if user exits 

            let user = await User.findOne({
                email
            });

            if (user) {
                res.status(400).json({
                    errors: [{
                        msg: 'User already exists'
                    }]
                })
            }

            //get user gravtar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            user = new User({
                name,
                email,
                avatar,
                password
            })
            // encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // return jsonwebtoken  
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(payload, config.get('jwtSecret'), {
                    expiresIn: 36000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    });
                });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }
    });

module.exports = router;