require('dotenv').config('.env');
const jwt = require('jsonwebtoken'); 
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
// TODO - require express-openid-connect and destructure auth from it
const {auth, requiresAuth} = require('express-openid-connect');

const { User, Cupcake } = require('./db');
const { getUser } = require('./middleware/getUser');
const { setUser } = require('./middleware/setUser');


app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//middleware


/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
  // define the config object
  // attach Auth0 OIDC auth router
  // create a GET / route handler that sends back Logged in or Logged out

  const {
    AUTH0_SECRET = 'a long, randomly-generated string stored in env', // generate one by using: `openssl rand -base64 32`
    AUTH0_AUDIENCE = 'http://localhost:3000',
    AUTH0_CLIENT_ID,
    AUTH0_BASE_URL,
  } = process.env;
  
  const config = {
    authRequired: false, // this is different from the documentation
    auth0Logout: true,
    secret: AUTH0_SECRET,
    baseURL: AUTH0_AUDIENCE,
    clientID: AUTH0_CLIENT_ID,
    issuerBaseURL: AUTH0_BASE_URL,
  };

  app.use(auth(config));

  app.use(getUser);
  app.use(setUser)


app.get('/', (req,res, next) => {
  try {
    res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out"); 
    console.log(req.oidc.user)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//requiresAuth() 
// This is middleware that will check if the user has been authenticated first then sending back user details 

app.get('/profile', requiresAuth(), (req,res,next) => {
  try {
    console.log(req.oidc.user)
    res.send(JSON.stringify(req.oidc.user));
  } catch (error) {
    console.log(error)
    next(error)
  }
})

app.get('/cupcakes', async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    console.log(req.oidc.user); 
    console.log(req.oidc);
    res.send(`<h1>Hello ${req.oidc.user.name}!</h1> <br> <img src=${req.oidc.user.picture}> <br> Here are your cupcakes ${JSON.stringify(cupcakes)}`);
    // res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//BONUS - Create a GET /me route BELOW both routers we’ve created.
// 1. Use User.findOne to search for a User whose username matches the req.oidc.user.nickname from Auth0.
// 2. Make sure to pass the raw: true property to the Sequelize query. Otherwise JWT won’t accept the fancy Sequelize object we have.
app.get('/me', async(req,res,next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.oidc.user.name
      },
  raw:true
})
if(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1w'})
  res.send({user, token})
}
  } catch (error) {
    console.log(erorr)
    next(error)
  }
  
})

//BONUS - POST /cupcakes 
// Return a newly created cupcake and the cupcake has an owner

app.post('/cupcake', async(req,res, next) => {
  try {
    if (req.user){
      const cupcake = req.body
      const user = req.user
      cupcake.userId = user.id
      const newCupcake = await Cupcake.create(cupcake)
      res.status(201).send(newCupcake)
     } else {
       res.sendStatus(401)
     }
  } catch (error) {
    console.log(error)
    next(error)
  }
  
})

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});

