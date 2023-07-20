var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');
var Question = require('../models/question');
var Answer = require('../models/answer');
var Comment = require('../models/comment');

// for creating the question
router.post('/', auth.verifyToken, async (req, res, next) => {
  req.body.author = req.user.userId;
  try {
    var question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// to fetch the questions
router.get('/', async (req, res, next) => {
  try {
    var questions = await Question.find({}).populate('answers','comments')
    res.status(201).json(questions);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// to update the questions
router.put(
  '/:questionId',
  auth.verifyToken,
  auth.isQuestionAuthor,
  async (req, res, next) => {
    try {
      var questionId = req.params.questionId;

      var updatedquestion = await Question.findByIdAndUpdate(
        questionId,
        req.body,
        { new: true }
      );

      res.status(201).json({ updatedquestion });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

// to delete the questions
router.delete(
  '/:slug',
  auth.verifyToken,
  auth.isOwnerOfQuestion,
  async (req, res, next) => {
    try {
      var slug = req.params.slug;
      var question = await Question.findOneAndDelete({ slug });
      
      await Answer.deleteMany({question: question._id});
      await Comment.deleteMany({ questionId: article._id });
      res.status(201).json({ message: 'Questions deleted successfully' });

      // res.status(201).json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

// for creating the answers
router.post('/:questionId/answers', auth.verifyToken, async (req, res, next) => {
  var questionId = req.params.questionId;

  try {

    var question = await Question.findById(questionId);

    if (!question) {
      return res.status(400).json({ error: 'Question not found' });
    }

    req.body.question = question._id;
    req.body.author = req.user.userId;

    var answer = await Answer.create(req.body);

    answer = await answer.populate('comments')

    question.answers.push(answer._id);
    await question.save();

    res.status(201).json({ question });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// for getting the answers fo particular questions
router.get('/:questionId/answers', async (req, res, next) => {
  var questionId = req.params.questionId;
  try {
    var question = await Question.findById(questionId).populate({ path:'answers', populate:{ path:'author', select:'_id username'},})
    if (!question) {
      res.status(400).json({ error: 'question not found' });
    }
    
    let answers = question.answers
   
    res.status(201).json({ answers});
  } catch (error) {
    res.status(400).json({ error });
  }
});

// for upvoting the question
router.post('/:questionId/upvote', auth.verifyToken,  async (req, res, next) => {
    try {
      let questionId = req.params.questionId;
      let userId = req.user.userId;
  
      let question = await Question.findById(questionId);
      if (!question) {
        return res.status(400).json({ error: 'Question not found' });
      }
      if (question.upvoters.includes(userId)) {
        return res.status(400).json({ error: 'You have already upvoted this question' });
      }

      question.upvoters.push(userId)
      question.upvotes += 1;
  
      // save
      await question.save();
  
      res.status(200).json({ message: 'Question upvoted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// // adding comments to question
router.post('/:slug/comments', auth.verifyToken, (req, res, next) => {
  var slug = req.params.slug;

  Question.findOne({ slug })
    .then((question) => {
      if (!question) {
        return res.status(400).json({ error: 'question not found' });
      } else {
        req.body.questionId = question._id;
        req.body.user = req.user.userId;

        Comment.create(req.body)
          .then((comment) => {
            // update the article with the comment ID
            Question.findByIdAndUpdate(
              question._id,
              { $push: { comments: comment._id } },
              { new: true }
            )
              .then((question) => {
                res.status(201).json(question);
              })
              .catch((error) => {
                res.status(400).json(error);
              });
          })
          .catch((error) => {
            res.status(400).json(error);
          });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;

