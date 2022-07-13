const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
require('dotenv').config();





//mongoose integration
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;







//cors implementation
const cors = require('cors');
app.use(cors());


/* let allowedOrigins = [
   'http://localhost:1234',
    'http://testsite.com'
]; 

 /* app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null,true);
        if(allowedOrigins.indexOf(origin) === -1){
            //if a specific origin isn't found on the list of allowed origins
        let message = "The CORS policy for this application doesn't allow access from origin " + origin;
       return callback(new Error(message ), false);
     }
    return callback(null,true);
 }
})); */



// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));


let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
});


const { check, validationResult } = require('express-validator');

//allows mongoose to connect to the db
//online

mongoose.connect( process.env.CONNECTION_URI , { useNewUrlParser: true, useUnifiedTopology: true });

// welcome message



app.get('/', (req, response) => {
    response.send('Welcome to my app!');
});




// CREATE a read for users
app.get('/users' , function (req, response) {
    Users.find()
     .then(function (users) {
         response.status(201).json(users);
     })
     .catch(function (err) {
         console.error(err);
         response.status(500).send('Error: ' + err);
     });
});


app.get('/movies', passport.authenticate('jwt', { session: false }), 
(req, response) => {
    Movies.find()
     .then((movies) => {
         response.status(201).json(movies);
     })
     .catch((err) => {
         console.error(err);
         response.status(500).send('Error: ' + err);
     });
});

// read to get movies by title

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, response) => {
    Movies.findOne({ Title: req.params.Title })
     .then((movie) => {
         response.json(movie);
     })
     .catch((err) => {
         console.error(err);
         response.status(500).send("Error: " + err);
     });
});

// read to get movie by genre name
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, response) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
     .then((genre) => {
         response.json(genre);
     })
     .catch((err) => {
         console.error(err);
         response.status(500).send('Error: ' + err);
     });
});

// read to get info on director by their name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, response) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
     .then((director) => {
         response.json(director);
     })
    .catch((err) => {
        console.error(err);
        response.status(500).send('Error: ' + err);
    });
});



/* We'll expect JSON in this format

{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
}*/

// allow a user to register
app.post('/users', [check('Username', 'Username is required.').isLength({min:5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed!').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail() ], (req, response) => {
    //check the validation object for any errors
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // search to see if a user with the requested username already exists
     .then((user) => {
         if (user) {
             return response.status(400).send(req.body.Username + ' already exists!')
         } else {
             Users.create({
                 Username: req.body.Username,
                 Password: hashedPassword,
                 Email: req.body.Email,
                 Birthday: req.body.Birthday,
             })
             .then((user) => {
                 response.status(201).json(user);
             })
             .catch((error) => {
                 console.error(error);
                 response.status(500).send('Error: ' + error);
             });
         }
     });
});

// get a user by username
app.get('/users/:Username', //passport.authenticate('jwt', { session: false }), 
(req, response) => {
    Users.findOne({ Username: req.params.Username })
     .then((user) => {
         response.json(user);
     })
     .catch((err) => {
         console.error(err);
         response.status(500).send('Error : ' + err);
     });
});

// allow users to update their info
app.put('/users/:Username', //passport.authenticate('jwt', { session: false }), 
(req, response) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                response.status(500).send('Error: ' + err);
            } else {
                response.json(updatedUser);
            }
        }
    );
});

// allow a user to add a movie to their favorite's list
app.post('/users/:Username/movies/:MovieID', //passport.authenticate('jwt', { session: false }), 
(req, response) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {$push: { FavoriteMovies: req.params.MovieID }},
        {new : true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                response.status(500).send('Error: ' + err);
            } else {
                response.json(updatedUser);
            }
        });
});

//allow user to delete movie from favorites list
app.delete('/users/:Username/movies/:MovieID', //passport.authenticate('jwt', { session: false }), 
(req, response) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
    {$pull : { FavoriteMovies: req.params.MovieID }},
    {new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            response.status(500).send('Error: ' + err);
        } else {
            response.json(updatedUser);
        }
    });
});

// allow user to be deleted
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, response) => {
    Users.findOneAndRemove({ Username: req.params.Username })
     .then((user) => {
         if (!user) {
             response.status(400).send(req.params.Username + ' was not found!');
         } else {
             response.status(200).send(req.params.Username + " was deleted!");
         }
     })
      .catch((err) => {
          console.error(err);
          response.status(500).send('Error: ' + err);
      });
});





const PORT = process.env.PORT || 8089;
app.listen( PORT , '0.0.0.0', () => {
    console.log('Listening on Port ' + PORT);
});

