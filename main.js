const UNSPLASH_QUERY = 'https://api.unsplash.com/search/photos?query='
const UNSPLASH_API_KEY = '&client_id=xqzSrlEZdhen2fjfcA-LMTkRBKL-TEzQ3JiHs7BpcMY';

const WEATHER_URL = 'https://api.weatherapi.com/v1/current.json?key=3d076c351ce34eb092a205038211711&q=';
const WEATHER_KEY = '3d076c351ce34eb092a205038211711';

const DEFAULT_IMAGE = "https://newsroom.aaa.com/wp-content/uploads/2021/06/Plane-taking-off-twilight-1024x684.jpg";

const destField = document.getElementById("dest");
const locationField = document.getElementById("loc");
const descriptionField = document.getElementById("desc");
const container = document.getElementById("submissions");
const label = document.getElementById("wishlist-label");

async function addDestination() {
    let destination = destField.value;
    let location = locationField.value;

    if (!location || !destination) {
        alert("Destination and location are required");
        return;
    }


    var card = await buildCard(destination, location, descriptionField.value);
    container.appendChild(card);
    clearFields();
    label.innerText = "My Wishlist";
}

async function buildCard(destination, location, description) {
    var card = document.createElement("div")
    card.className = "card card-style";
    let tempText = document.createElement("div");
    // Create temp based on loc
    if (location.length > 0) {
        try {
            let temp = await getWeatherData(location);
            tempText.className = "alert alert-success";
            tempText.innerText = "Currently " + temp + "F";
        } catch (error) {
            tempText.innerText = "Weather unavailable";
        }
    }

    // Create the image
    var img = await buildImage(destination);

    // Create the temperature data
    let tempAndImage = document.createElement("div");
    if (location) {
        tempAndImage.append(tempText);
    }
    tempAndImage.append(img);

    var everythingElse = buildTitleAndButtons(destination, location, description);

    // Append the nodes
    card.append(tempAndImage);
    card.append(everythingElse);
    return card;
}

function buildTitleAndButtons(dest, loc, desc) {

    // Create title
    let title = document.createElement("h5");
    let titleText = document.createTextNode(dest);
    title.appendChild(titleText);

    // Create location
    let location = document.createElement("h6");
    let locationText = document.createTextNode(loc);
    location.appendChild(locationText);

    // Create description label   
    let descElement = document.createElement("p");
    descElement.innerText = " ";
    if (desc.length !== 0) {
        descText = document.createTextNode(desc);
        descElement.appendChild(descText);
    }
    let mainDiv = document.createElement("div");
    mainDiv.append(title);
    mainDiv.append(location);
    mainDiv.append(descElement);
    mainDiv.append(getButtons());
    return mainDiv;
}

async function buildImage(query) {

    let url;
    let endpoint = UNSPLASH_QUERY + query + UNSPLASH_API_KEY;

    try {
        let response = await fetch(endpoint);
        let object = await response.json();
        let array = object.results;
        let randIndex = Math.floor(Math.random() * (array.length - 1));
        url = array[randIndex].urls.small; // Response has an array of options - choose a random one
    } catch (error) {
        console.log(error);
        url = DEFAULT_IMAGE;
    }

    let img = document.createElement("img");
    img.src = url ? url : DEFAULT_IMAGE;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    return img;
}

function getButtons() {
    var editButton = document.createElement("button");
    editButton.setAttribute("class", "btn btn-warning");
    editButton.addEventListener("click", edit);
    editButton.appendChild(document.createTextNode("Edit"));

    var removeButton = document.createElement("button");
    removeButton.setAttribute("class", "btn btn-danger");
    removeButton.addEventListener("click", remove);
    removeButton.appendChild(document.createTextNode("Remove"));

    var buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("class", "d-flex justify-content-between");
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(removeButton);
    return buttonContainer;
}

function clearFields() {
    destField.value = "";
    locationField.value = "";
    descriptionField.value = "";
}

async function edit(event) {
    // Get all the things
    let card = event.target.parentElement.parentElement;
    let destination = card.children[0];
    let location = card.children[1];
    let description = card.children[2];
    let image = card.previousElementSibling.children[card.previousElementSibling.children.length - 1]; // The image is the last element

    // Request new values from user
    let newDest = window.prompt("Enter new destination");
    let newLocation = window.prompt("Enter new location");
    let newDescription = window.prompt("Enter new description");

    // Set all the new values    
    if (newLocation.length > 0) {
        location.innerText = newLocation;
    }

    if (newDescription.length > 0) {
        description.innerText = newDescription;
    }

    if (newDest.length > 0) {
        destination.innerText = newDest;
        let newImage = await buildImage(newDest);
        image.src = newImage.src;
        newImage.remove(); // Not sure if the new image would remain in the DOM - so removing it here just in case memory leak
    }
}

function remove(event) {
    var card = event.target.parentElement.parentElement.parentElement;
    card.remove();
}

async function getWeatherData(query) {
    let url = WEATHER_URL + query + "&aqi=no";
    let response = await fetch(url);
    let object = await response.json();
    return object.current.temp_f;
}