var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    text: { type: String, required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    answerId: { type: Schema.Types.ObjectId, ref: 'Answer' },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
