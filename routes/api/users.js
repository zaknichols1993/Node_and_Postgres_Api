const Router = require('express-promise-router')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const db = require('../../db/index.js')

const router = new Router()

// @route    GET api/users
// @desc     Get all users
// @access   Public
router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM public.users')
        res.json(rows)
    } catch (err) {
        console.error(err)
    }
})

// @route    POST api/users
// @desc     Register a user
// @access   Public
router.post('/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email } = req.body
        let { password } = req.body

        try {
            let user = await db.query('SELECT email, user_id FROM public.users WHERE email = $1', [email])
            if (user.rows.length > 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
            }

            const salt = await bcrypt.genSalt(10);

            password = await bcrypt.hash(password, salt);

            const { rows } = await db.query(`INSERT INTO public.users (name, email, password) VALUES ($1, $2, $3) RETURNING *`, [name, email, password])

            const payload = {
                user: {
                    id: rows[0].user_id
                }
            }

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.stack)
        }
    });

module.exports = router