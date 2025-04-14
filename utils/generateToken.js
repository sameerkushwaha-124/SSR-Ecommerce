const jwt = require('jsonwebtoken');

const generateToken = (person)=>{
    return jwt.sign({email:person.email, id:person._id},process.env.JWT_KEY);
}


module.exports.generateToken = generateToken;