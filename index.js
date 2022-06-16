const express = require("express"),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

//mongoose integration
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


//allows mongoose to connect to the db
//online

mongoose.connect( process.env.CONNECTION_URI , { useNewUrlParser: true, useUnifiedTopology: true });



const app = express();
const { check, validationResult } = require('express-validator');


//cors implementation
const cors = require('cors');
app.use(cors());


//let allowedOrigins = [
   // 'http://localhost:8089',
    // 'http://testsite.com'
// ];

// app.use(cors({
   // origin: (origin, callback) => {
     //   if(!origin) return callback(null,true);
      //  if(allowedOrigins.indexOf(origin) === -1){
            //if a specific origin isn't found on the list of allowed origins
        //    let message = "The CORS policy for this application doesn't allow access from origin " + origin;
         //   return callback(new Error(message ), false);
       // }
       // return callback(null,true);
   // }
// }));



// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));


let auth = require('./auth')(app);
const passport = require('passport');
const { response } = require("express");
require('./passport');


// welcome message
app.get('/', (req, res) => {
    response.send('Welcome to my app!');
});



// CREATE a read for users
app.get('/users' , function (req, res) {
    Users.find()
     .then(function (users) {
         res.status(201).json(users);
     })
     .catch(function (err) {
         console.error(err);
         res.status(500).send('Error: ' + err);
     });
});


app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
     .then((movies) => {
         res.status(201).json(movies);
     })
     .catch((err) => {
         console.error(err);
         res.status(500).send('Error: ' + err);
     });
});

// read to get movies by title

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
     .then((movie) => {
         res.json(movie);
     })
     .catch((err) => {
         console.error(err);
         res.status(500).send("Error: " + err);
     });
});

// read to get movie by genre name
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
     .then((genre) => {
         res.json(genre);
     })
     .catch((err) => {
         console.error(err);
         res.status(500).send('Error: ' + err);
     });
});

// read to get info on director by their name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
     .then((director) => {
         res.json(director);
     })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
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
    check('Email', 'Email does not appear to be valid').isEmail() ],  (req, res) => {
    //check the validation object for any errors
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // search to see if a user with the requested username already exists
     .then((user) => {
         if (user) {
             return res.status(400).send(req.body.Username + ' already exists!')
         } else {
             Users.create({
                 Username: req.body.Username,
                 Password: hashedPassword,
                 Email: req.body.Email,
                 Birthday: req.body.Birthday,
             })
             .then((user) => {
                 res.status(201).json(user);
             })
             .catch((error) => {
                 console.error(error);
                 res.status(500).send('Error: ' + error);
             });
         }
     });
});

// get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
     .then((user) => {
         res.json(user);
     })
     .catch((err) => {
         console.error(err);
         res.status(500).send('Error : ' + err);
     });
});

// allow users to update their info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

// allow a user to add a movie to their favorite's list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {$push: { FavoriteMovies: req.params.MovieID }},
        {new : true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

//allow user to delete movie from favorites list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
    {$pull : { FavoriteMovies: req.params.MovieID }},
    {new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// allow user to be deleted
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
     .then((user) => {
         if (!user) {
             res.status(400).send(req.params.Username + ' was not found!');
         } else {
             res.status(200).send(req.params.Username + " was deleted!");
         }
     })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});





const port = process.env.PORT || port;
app.listen( port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});


