function main() {
    console.log("Hello World!");

    let objectID = '11051';
    let requestURL = 'https://emuseum.nasher.duke.edu/objects/' + objectID + '/json';

    // Replace testURL with requestURL when whitelisted
    testURL = 'https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json';

    let request = new XMLHttpRequest();
    console.log(testURL);

    request.open('GET', testURL);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        const relicData = request.response;
        console.log(relicData);

        // json data now stored in a javascript object
    }
}