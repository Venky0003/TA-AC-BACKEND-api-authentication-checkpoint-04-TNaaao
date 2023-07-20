var express = require('express');
var router = express.Router();
var Question = require('../models/question');

router.get('/', async (req, res, next) => {
  try {
    var tags = await Question.distinct('tags');

    res.status(200).json({ tags });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;