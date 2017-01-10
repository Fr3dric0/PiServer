const jwt = require('jsonwebtoken');

// Extract token secret
const config = require('../../bin/config/_config.json');
const secret = config['token-secret'] || 'Sf!ljerdigEJeDlaerOIJsfs@fsklwe';

module.exports = {

    generate(pkg) {
        return jwt.sign(pkg, secret);
    },

    verify(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return reject(new Error('Token not authenticated'));
                }

                return resolve(decoded);
            });
        });
    }
};