const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiryDate: Date
});

// Token 만료 여부 확인 메소드
refreshTokenSchema.statics.isTokenExpired = function(token) {
  return token.expiryDate.getTime() < new Date().getTime();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
