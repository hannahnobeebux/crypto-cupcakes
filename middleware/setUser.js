const jwt = require('jsonwebtoken');
require("dotenv").config()


// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware
const setUser = (req, res, next) => {
    try {
      // has the user passed in their token?
      const auth = req.header("Authorization");
    if (!auth) {
      // send the user to another part of the webpage for example 
      next(); 
      // exit if else block
      return
    } 
    // usually we have const [type, token] when destructing the token creation - we need the type 
    // in this case, we're ignoring the type, only grabbing the second part of the array 
    // we only want the token part of the header, not the type 
  
    // type = 'Bearer' 
    const [, token] = auth.split(" "); 
    // verifying the user token against the token from env file  
    const payload = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = payload; 
    next(); 
    } catch (error) {
      next(error)
    }
    
  }

  module.exports = { setUser }