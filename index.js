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

mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');



let users = [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favoriteMovies: ["The Fountain"]
    }

]


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
app.post('/users',  (req, res) => {
    Users.findOne({ Username: req.body.Username })
     .then((user) => {
         if (user) {
             return res.status(400).send(req.body.Username + 'already exists!')
         } else {
             Users.create({
                 Username: req.body.Username,
                 Password: req.body.Password,
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





app.listen(8089, () => console.log('listeing on port 8089!'));



//this willl replace the complete app.post(/users) function