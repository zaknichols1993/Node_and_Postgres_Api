const Router = require('express-promise-router')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const db = require('../../db/index')

const router = new Router()

// @route    POST api/auth
// @desc     Register user
// @access   Public
router.post('/',
  [
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

    const { email, password } = req.body

    try {
      let user = await db.query('SELECT email, password, user_id FROM public.users WHERE email = $1', [email])

      if (user.rows[0] <= 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'That email does not exist' }] });
      }

      const passwordsMatch = await bcrypt.compare(password, user.rows[0].password);

      if (!passwordsMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid password' }] });
      }

      const payload = {
        user: {
          id: user.rows[0].user_id
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