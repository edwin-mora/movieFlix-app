const express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());


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

let movies = [
    {
        "Title": "The Fountain",
        "Year": 2006,
        "Descirption": "As a modern-day scientist, Tommy is struggling with mortality, desperately searching for the medical breakthrough that will save the life of his cancer-stricken wife, Izzi.",
        "Genre": {
            "Name": "Drama",
            "Description":"Serious presentations or stories with settings or life situations that portray realistic characters in conflict with either themselves, others, or forces of nature. "
        },
        "Director": {
            "Name": "Darren Aronofsky",
            "Bio": "Darren Aronofsky was born February 12, 1969, in Brooklyn, New York. Growing up, Darren was always artistic: he loved classic movies and, as a teenager, he even spent time doing graffiti art. After high school, Darren went to Harvard University to study film (both live-action and animation). He won several film awards after completing his senior thesis film, Supermarket Sweep, starring Sean Gullette, which went on to becoming a National Student Academy Award finalist. Aronofsky didn't make a feature film until five years later, in February 1996, where he began creating the concept for Pi (1998). After Darren's script for Pi (1998) received great reactions from friends, he began production. The film re-teamed Aronofsky with Gullette, who played the lead. This went on to further successes, such as Requiem for a Dream (2000), The Wrestler (2008) and Black Swan (2010). Most recently, he completed the films Noah (2014) and Mother! (2017).",
            "Birth": 1969
        }
    },

    {
        "Title": "Forrest Gump",
        "Year": 1994,
        "Description": "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
        "Genre": {
            "Name": "Drama",
            "Description": "Serious presentations or stories with settings or life situations that portray realistic characters in conflict with either themselves, others, or forces of nature."
        },
        "Director": {
            "Name": "Robert Zemeckis",
            "Bio": "A whiz-kid with special effects, Robert is from the Spielberg camp of film-making (Steven Spielberg produced many of his films). Usually working with writing partner Bob Gale, Robert's earlier films show he has a talent for zany comedy (Romancing the Stone (1984), 1941 (1979)) and special effect vehicles (Who Framed Roger Rabbit (1988) and Back to the Future (1985)). His later films have become more serious, with the hugely successful Tom Hanks vehicle Forrest Gump (1994) and the Jodie Foster film Contact (1997), both critically acclaimed movies. Again, these films incorporate stunning effects. Robert has proved he can work a serious story around great effects.",
            "Birth": 1951
        }
    },
    
    {
        "Title": "Star Wars: Episode V - The Empire Strikes Back",
        "Year": 1980,
        "Description": "After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda, while his friends are pursued across the galaxy by Darth Vader and bounty hunter Boba Fett.",
        "Genre": {
            "Name":"Science Fiction",
            "Description": "A genre of speculative fiction which typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life."
        },
            "Director": {
            "Name" :"Irvin Kershner",
            "Bio": "Irvin Kershner was born on April 29, 1923 in Philadelphia, Pennsylvania. A graduate of the University of Southern California film school, Kershner began his career in 1950, producing documentaries for the United States Information Service in the Middle East. He later turned to television, directing and photographing a series of documentaries called: Confidential File. Kershner was one of the directors given his first break by producer Roger Corman, for whom he shot Stakeout on Dope Street (1958). The main theme that runs through many of his films is social alienation and human weaknesses - although his biggest commercial success was the science fiction blockbuster Star Wars: Episode V - The Empire Strikes Back (1980). Irvin Kershner died at age 87 of lung cancer in his home in Los Angeles, California on November 27, 2010.",
            "Birth": 1923
        }

    }

];

// CREATE use POST (users)
app.post('/users' , (req, res) => {
    const newUser = req.body;
    
    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users need names')
    }
});

//UPDATE users id

app.put('/users/:id' , (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no ssuch user')
    }
});


//UPDATE users favorite movies

app.post('/users/:id/:movieTitle' , (req, res) => {
    const { id, movieTitle } = req.params;

    
    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send( `${movieTitle} has been added to user ${id}'s  array`);;
    } else {
        res.status(400).send('no ssuch user')
    }
});

//DELETE

app.delete('/users/:id/:movieTitle' , (req, res) => {
    const { id, movieTitle } = req.params;
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s  array`);;
    } else {
        res.status(400).send('no ssuch user')
    }
});



//DELETE allow user to de-register email

app.delete('/users/:id' , (req, res) => {
    const { id } = req.params;
    
    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no ssuch user')
    }
});







//1st READ 

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//2nd READ

app.get('/movies/:title', (req, res) => {
    // can write differently
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such title!')
    }
});

//3rd READ

app.get('/movies/genre/:genreName', (req, res) => {
    // can write differently
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre!')
    }
});


// director by name READ

app.get('/movies/directors/:directorName', (req, res) => {
    // can write differently
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director!')
    }
});









app.listen(8089, () => console.log('listeing on port 8089!'));