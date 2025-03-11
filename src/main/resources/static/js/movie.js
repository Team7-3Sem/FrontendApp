console.log("Jeg er i movie js");

function createMovie() {
    const movie = {}
    movie.title = "Film 1";
    movie.genre = "fantasy"
    movie.ageRestriction = 18;
    movie.description = "beskrivelse af film";
    movie.duration = 150;
    movie.releaseDate = "2019-02-02";
    movie.endDate = "2019-08-08";
    movie.isActive = true;

    return movie;
}

const url = "http://localhost:8080/kinogris";

async function postDataAsJson(url, obj) {
    const objectAsJsonString = JSON.stringify(obj);
    console.log(objectAsJsonString);
    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: objectAsJsonString,
    };
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        const errorMessage = await response.text();
        console.error(errorMessage);
    } else {
        const js1 = await response.json();
        console.log(js1);
    }
    return response;
}

async function postMovie(movie) {
    const json = await postDataAsJson(url, movie);
    console.log(json);
}

const mov1 = createMovie();
console.log(mov1);
postMovie(mov1);