var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var adminSchema = new Schema(
  {
    admin_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 5, required: true },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  
  adminSchema.methods.verifyPassword = async function (password) {
    try {
      var result = await bcrypt.compare(password, this.password);
      return result;
    } catch (error) {
      return error;
    }
  };
  
  adminSchema.methods.signToken = async function () {
    // console.log(this) is admin
    var payload = { adminId: this.id, email: this.email };
    try {
      var token = await jwt.sign(payload, process.env.TOKEN_SECRET);
      return token;
    } catch (error) {
      return error;
    }
  };
  
  adminSchema.methods.adminJSON = function (token) {
    return {
      admin_name: this.admin_name,
      email: this.email,
      token: token,
    };
  };
  

module.exports = mongoose.model('Admin', adminSchema)