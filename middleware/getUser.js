const { User } = require("../db")

// TASK 1 - Add the user
// Create a new piece of middleware that will run right after the Auth0 auth(config) router.
const getUser = async (req, res, next) => {
    try {    
        if (req.oidc.user) {
              //_isCreated means that there is a second parameter available but we're not using it
              // could also be written/defined as const[user, ] <-- this isnt readable 
            const [user, _isCreated] = await User.findOrCreate({ 
                where: {
                    username: req.oidc.user.name, 
                    name: req.oidc.user.nickname, 
                    email: req.oidc.user.email
                }, 
            })
            
            req.user = user 
        }
        next()
    } catch (error) {
        console.log(error)
        next()
    }
   
  
}

module.exports = {getUser}