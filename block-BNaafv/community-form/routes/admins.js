var express = require('express');
var router = express.Router();
var Admin = require('../models/admin');
var auth = require('../middlewares/auth');
var User = require('../models/user');

router.get('/current-user', auth.verifyToken, async (req, res, next) => {
    Admin.findById(req.user.userId)
      .populate('followers')
      .then((user) => {
        if (!user) {
          return res.sendStatus(401);
        }

        return res.json({ user });
      })
      .catch((error) => {
        console.log(error);
      });
  });

// registration route handler
router.post('/register', async (req, res, next) => {
  try {
    var admin = await Admin.create(req.body);
    var token = await admin.signToken();
    res.status(201).json({ admin: admin.adminJSON(token) });
  } catch (error) {
    next(error);
  }
});

// login route handler
router.post('/login', async (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Password required' });
  }

  try {
    var admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: 'Email not registered' });
    }
    var result = await admin.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: 'Incorrect Password' });
    }
    // generate tokens
    var token = await admin.signToken();
    //  console.log(token);
    res.json({ admin: admin.adminJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.put('/', auth.adminVerifyToken, async (req, res, next) => {
  let adminId = req.admin.adminId;
  try {
    var admin = await Admin.findByIdAndUpdate(adminId, req.body);
    res.status(201).json({ admin });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/:userId/block', auth.adminVerifyToken, (req, res, next) => {
  let userId = req.params.userId;

  User.findById(userId )
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.blocked = !user.blocked;
      user.save();
      res.status(201).json({ message: 'User Blocked Successfuly' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error });
    });
});

module.exports = router;

