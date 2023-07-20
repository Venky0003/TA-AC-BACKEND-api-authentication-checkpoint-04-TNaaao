var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');
var Question = require('../models/question');
var Answer = require('../models/answer');
var Comment = require('../models/comment');

router.put(
  '/:answerId',
  auth.verifyToken,

  async (req, res, next) => {
    var answerId = req.params.answerId;
    try {
      var answer = await Answer.findByIdAndUpdate(answerId, req.body, {
        new: true,
      });
      if (!answer) {
        res.status(400).json({ error: 'answer not found' });
      }

      res.status(201).json({ answer });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

router.delete('/:answerId', auth.verifyToken, async (req, res, next) => {
  try {
    var answerId = req.params.answerId;

    var answer = await Answer.findByIdAndDelete(answerId);

    res.status(201).json({ message: 'Answer deleted Successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});


router.post('/:answerId/upvote', auth.verifyToken,  async (req, res, next) => {
    try {
      let answerId = req.params.answerId;
      let userId = req.user.userId;
  
      let answer = await Answer.findById(answerId);
      if (!answer) {
        return res.status(400).json({ error: 'answer not found' });
      }
      if (answer.upvoters.includes(userId)) {
        return res.status(400).json({ error: 'You have already upvoted this answer' });
      }

      answer.upvoters.push(userId)
      answer.upvotes += 1;
  
      // save
      await answer.save();
  
      res.status(200).json({ message: 'Question upvoted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.post('/:answerId/comments', auth.verifyToken, async (req, res, next) => {
  try {
    var answerId = req.params.answerId;
   
    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return res.status(400).json({ error: 'Answer not found' });
    }

    req.body.answerId = answer._id;
    req.body.user = req.user.userId;

    const comment = await Comment.create(req.body);

    if (!answer.comments) {
      answer.comments = [];
    }
    answer.comments.push(comment._id);
    await answer.save();

    const populatedAnswer = await Answer.findById(answerId).populate('comments');

    res.status(201).json(populatedAnswer);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});


module.exports = router;
