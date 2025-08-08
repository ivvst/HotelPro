const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALTROUNDS) || 5;

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  tel: String,
  email: { type: String, required: true, unique: true },
  username: {
    type: String, required: true, unique: true,
    minlength: [5, 'Username should be at least 5 chars'],
    validate: { validator: v => /[a-zA-Z0-9]+/g.test(v), message: 'Only latin letters and digits!' }
  },
  password: {
    type: String, required: true,
    minlength: [5, 'Password should be at least 5 chars'],
    validate: { validator: v => /[a-zA-Z0-9]+/g.test(v), message: 'Only latin letters and digits!' }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  themes: [{ type: ObjectId, ref: 'Theme' }],
  posts: [{ type: ObjectId, ref: 'Post' }],
}, { timestamps: { createdAt: 'created_at' } });

// 👇 методът ТРЯБВА да го има
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// 👇 hash на паролата
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('User', userSchema);
