const express = require("express");
const app = express();

const morgan = require('morgan');


// second line declares a variable that encapsulates Express's functionality to configure to the web server

// Express GET route with endpoint /movies

let topMovies = [
    {
        title: 'The Hateful Eight',
        director: 'Qunetin Tarantino'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola'
    },
    {
        title: 'Forrest Gump',
        director: 'Robert Zemeckis'
    }
];

// GET requests
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// GET route located at the endpoint "/", with default text:
app.get('/', (req, res) => {
    res.send('Welcome to my movie list!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//express.static for dcoumentation.html file from the public folder
app.use(express.static('public'));

// morgan with app.use() function
app.use(morgan('common'));

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oh no, something broke!');
});