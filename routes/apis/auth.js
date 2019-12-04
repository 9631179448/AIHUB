const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {
    check,
    validationResult
} = require('express-validator');

//routes auth
//@desc  test routes
//@access public

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.massege);
        res.status(500).send('Server error');
    }
});

//routes Post api/auth
//@desc  autheticated
//@access public
router.post('/',
    [
        check('email', 'email  is required').isEmail(),
        check('password', 'password is required').exists()

    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            email,
            password
        } = req.body;
        try {
            // if user exits 

            let user = await User.findOne({
                email
            });

            if (!user) {
                res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400)
                    .json({
                        errors: [{
                            msg: 'password is not valid'
                        }]
                    })
            }

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