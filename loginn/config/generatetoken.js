const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id },  'fastshare', {
        expiresIn: "1d",
    });
};

module.exports = generateToken;
