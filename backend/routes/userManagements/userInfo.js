const express = require('express');
const router = express.Router();
const connection = require('../../db');
const sessionConfig = require('../../sessionConfig');

router.use(sessionConfig);

const userInfo = async (req, res) => {
    const { userId } = req.session.user; // 세션에서 사용자 ID 가져오기
};

module.exports = router;
// export default userInfo;