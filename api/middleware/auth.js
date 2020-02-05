const jwt = require('jsonwebtoken')
const keys = require('../../config')
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        console.log('token', token)

        const decoded = jwt.verify(token, keys.jwtkey) 
        console.log('decoded', decoded)
        req.userData = decoded;
        next()
    } catch {
        return res.status(401).json({message: 'Auth Failed'})
    }

}