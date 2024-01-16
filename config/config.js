require('dotenv').config();

let CONFIG = {};


CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '2000';

CONFIG.price = { min: 1, max: 300000 };

CONFIG.category = ['Fashion', 'Clothes', 'Shoes', 'Jwellary'];

CONFIG.name = { min: 3, max: 200 };

CONFIG.description = { min: 10, max: 2000 };

CONFIG.img_src = /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+(\/||\\[a-z_\-\s0-9\.]+)+\.(jpg|jpeg|png)$/;


CONFIG.db_uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';

CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '28800';

CONFIG.jwt_expiration = process.env.JWT_ENCRYPTIOiN || '200000'

CONFIG.jwt_encryption = process.env.secret || 'V@$_F!N@!L'

CONFIG.verify_code = process.env.VERIFY_CODE

module.exports.CONFIG = CONFIG;