const jwt = require('jsonwebtoken');
require('dotenv').config();

const postModifiable = (req, post) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.jwt_token);
    const userId = decodedToken.userId;

    return post.user_id === userId || decodedToken.admin === 1;
}

module.exports = {
    postModifiable
}