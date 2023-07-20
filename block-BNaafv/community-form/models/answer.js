var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema(
  {
    text: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question:{type:Schema.Types.ObjectId, ref:'Question', required: true},
    upvoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    upvotes: { type: Number, default: 0 },
    comments:[{ type: Schema.Types.ObjectId, ref:'Comment'}]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', answerSchema);
