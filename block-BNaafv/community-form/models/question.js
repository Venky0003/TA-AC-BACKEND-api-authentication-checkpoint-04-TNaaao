var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slugify = require('slugify');

var questionSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, lowercase: true, unique: true },
    description: String,
    tags: [String],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    upvoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    upvotes: { type: Number, default: 0 },
    comments:[{ type: Schema.Types.ObjectId, ref:'Comment'}]
  },
  { timestamps: true }
);

questionSchema.pre('save', async function (next) {
  if (!this.isModified('title')) {
    return next();
  }
  this.slug = await slugify(this.title, { lowercase: true, strict: true });
  next();
});

module.exports = mongoose.model('Question', questionSchema);
