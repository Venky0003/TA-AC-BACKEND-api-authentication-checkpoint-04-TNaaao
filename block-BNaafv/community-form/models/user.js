var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 5, required: true },
    name:String,
    image:String,
    bio:String,
    following:[{type:Schema.Types.ObjectId, ref:'User'}],
    followers:[{type:Schema.Types.ObjectId, ref:'User'}],
    blocked:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    var result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.signToken = async function () {
  // console.log(this) is user
  var payload = { userId: this.id, email: this.email };
  try {
    var token = await jwt.sign(payload, process.env.TOKEN_SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    username: this.username,
    email: this.email,
    token: token,
  };
};


userSchema.methods.profileJSON = function () {
    return {
      username: this.username,
      name:this.name,
      bio:this.bio,
      image:this.image,
      email: this.email,
    };
  };


module.exports = mongoose.model('User', userSchema);
