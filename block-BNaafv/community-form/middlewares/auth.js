var jwt = require('jsonwebtoken');
var Question = require('../models/question');

module.exports = {
  verifyToken: async (req, res, next) => {
    // console.log(req.headers);
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = await jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(payload);
        req.user = payload;
        next();
      } else {
        res.status(400).json({ error: 'Token Required' });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  adminVerifyToken: async (req, res, next) => {
    // console.log(req.headers);
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = await jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(payload);
        req.admin = payload;
        next();
      } else {
        res.status(400).json({ error: 'Token Required' });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  isQuestionAuthor: async (req, res, next) => {
    try {
      var userId = req.user.userId;
      var id = req.params.questionId;
  
      var question = await Question.findById(id);

      if (!question) {
        return res.status(400).json({ error: 'Question not found' });
      }

      if (question.author.toString() !== userId) {
        return res.status(400).json({ error: 'you are not authorized' });
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server error' });
    }
  },
  isOwnerOfQuestion: async (req, res, next) => {
    try {
      var userId = req.user.userId;
      var slug = req.params.slug;
  
      var question = await Question.findOne({slug});

      if (!question) {
        return res.status(400).json({ error: 'Question not found' });
      }

      if (question.author.toString() !== userId) {
        return res.status(400).json({ error: 'you are not authorized' });
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server error' });
    }
  },
};
