const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 회원가입 라우트
router.post('/register', authController.register);

// 로그인 라우트
router.post('/login', authController.login);

// 로그아웃 라우트
router.post('/logout', authController.logout);

module.exports = router;
