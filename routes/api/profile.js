const Router = require('express-promise-router')
const auth = require('../../middleware/auth');

const { check, validationResult } = require('express-validator');

const db = require('../../db/index')

const router = new Router()

router.get('/', auth, async (req, res) => {
    const profiles = await db.query('SELECT * FROM public.profile')
    res.json(profiles.rows)
    console.log(profiles.rows)
})

// @route    GET api/users
// @desc     GET my profile
// @access   Private
router.get('/', auth, async (req, res) => {
    // user object is attached to token when signed and sent back as json 
    const { id } = req.user
    try {
        console.log(req.user)

        const profile = await db.query('SELECT name, email, user_id FROM public.users WHERE user_id = $1', [id])

        if (profile.rows.length <= 0) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile.rows[0])
    } catch (err) {
        console.error(err)
    }
})

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params

    try {
        console.log(id)

        const profile = await db.query('SELECT status, age FROM public.profile WHERE user_id = $1', [id])

        if (profile.rows.length <= 0) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile.rows[0])
    } catch (err) {
        console.error(err)
    }
})

router.post(
    '/',
    auth,
    [
        check('status', 'Status is required')
            .not()
            .isEmpty(),
        check('age', 'Age is required')
            .not()
            .isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, age } = req.body
        const { id } = req.user

        try {
            // Postgres equivelant to an 'upsert.'
            const { rows } = await db.query('INSERT INTO public.profile (status, age, user_id, profile_id) VALUES ($1, $2, $3, $3) ON CONFLICT (user_id) DO UPDATE SET status = $1, age = $2 RETURNING *', [status, age, id])
            console.log(rows)
            res.json(rows)
        } catch (err) {
            console.error(err.stack)
        }

    });

module.exports = router