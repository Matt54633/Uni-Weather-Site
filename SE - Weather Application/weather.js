/*
This file sends the API requests for the weather data and handles pinning and deleting locations
*/

const ApiKey = "9d5c5c26680bbe426226caec5f6d8942";
const DegreeSymbol = '\xB0'; // ascii used to prevent errors when displaying degrees symbol

function Weather() {

    //get users location 
    navigator.geolocation.getCurrentPosition(function(position) {
        var x = position.coords.latitude;
        var y = position.coords.longitude;

        //set url for api call
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&appid=${ApiKey}&units=metric`;
        console.log(url);

        //send the api call and save the response into an array
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const {
                    main,
                    name,
                    weather,
                    wind
                } = data;
                const icon = "http://openweathermap.org/img/wn/" + weather[0].icon + "@2x.png";

                //set values of current location card
                document.getElementById('CurrentLocationTitle').innerHTML = name;
                document.getElementById('CurrentLocationImg').src = icon;
                document.getElementById('CurrentLocationTemp').innerHTML = Math.round(main.temp) + " Degrees";

                //set values of the next hour card - barring UV Index as this needs to be done via another call
                document.getElementById('WeatherInfoList1').innerHTML = "Feels like: " + Math.round(main.feels_like) + DegreeSymbol;
                document.getElementById('WeatherInfoList2').innerHTML = "Wind: " + Math.round(wind.speed) + "mph";
                document.getElementById('WeatherInfoList3').innerHTML = "Humidity: " + main.humidity + "%";
            })

        //second api call, this gets UV index and forecast data for the forecast card
        const OneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&appid=${ApiKey}&units=metric`;
        console.log(OneCallUrl);
        fetch(OneCallUrl)
            .then(response => response.json())
            .then(data => {
                const {
                    hourly,
                    daily
                } = data;

                //set the uv index value for the next hour card
                document.getElementById('WeatherInfoList4').innerHTML = "UV Index: " + Math.round(hourly[0].uvi);

                //fill in the 7-hour forecast by looping over each li
                for (let i = 1; i < 8; i++) {
                    let date = new Date(hourly[i].dt * 1000);
                    let hours = date.getHours();
                    document.getElementById("HourTitle" + [i]).innerHTML = hours + ":00";
                    document.getElementById("HourImg" + [i]).src = "http://openweathermap.org/img/wn/" + hourly[i].weather[0]["icon"] + "@2x.png";
                    document.getElementById("HourTemp" + [i]).innerHTML = Math.round(hourly[i].temp) + DegreeSymbol;
                }

                //create an array to store the days of the week
                var week = new Array(
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                );

                //fill in the 7-day forecast
                for (let i = 1; i < 8; i++) {
                    let day = new Date();
                    document.getElementById("DayTitle" + [i]).innerHTML = week[(day.getDay() + 1 + (i - 1)) % 7];
                    document.getElementById("DayImg" + [i]).src = "http://openweathermap.org/img/wn/" + daily[i].weather[0]["icon"] + "@2x.png"
                    document.getElementById("DayTemp" + [i]).innerHTML = "H:" + Math.round(daily[i].temp["max"]) + DegreeSymbol + "L:" + Math.round(daily[i].temp["min"]) + DegreeSymbol;
                }
            })
    })
}

//create variables needed to save values of searched location data that is needed for pinned location
var SearchTitle;
var SearchImg;
var SearchInfo1;
var SearchInfo2;
var SearchInfo3;
var SearchInfo4;

//this function takes the input from the search box and creates an API call for that location. The weather data is added to the top card in the favourites section.
function SearchLocation() {
    const searchValue = document.getElementById('Input').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=${ApiKey}&units=metric`;
    console.log(url);

    //send api request and return json data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const {
                main,
                name,
                sys,
                wind,
                weather,
                cod
            } = data;

            document.getElementById('SearchedLocation').style.display = "block";
            //if there was a search error display error message
            if (cod == 404) {
                document.getElementById('SearchedTitle').innerHTML = "This city was not recognized, please try again";
                document.getElementById('SearchedImg').src = "error.png";
                //clear list
                for (i = 1; i <= 4; i++) {
                    document.getElementById(`SearchedInfo${i}`).innerHTML = "";
                }
            }
            //if the search was successful display searched location
            else if (cod == 200) {
                //set the value of the top card to the searched location data if code returned via the query is success
                document.getElementById('SearchedTitle').innerHTML = name + ", " + sys.country;
                document.getElementById('SearchedImg').src = "http://openweathermap.org/img/wn/" + weather[0]["icon"] + "@2x.png"
                document.getElementById('SearchedInfo1').innerHTML = "Current: " + Math.round(main.temp) + DegreeSymbol;
                document.getElementById('SearchedInfo2').innerHTML = "Humidity: " + main.humidity + "%";
                document.getElementById('SearchedInfo3').innerHTML = "Feels like: " + Math.round(main.feels_like) + DegreeSymbol;
                document.getElementById('SearchedInfo4').innerHTML = "Wind: " + Math.round(wind.speed) + "mph";
            }
            //if unexpected error occured then display error message
            else {
                document.getElementById('SearchedTitle').innerHTML = "An unexpected error occured";
                document.getElementById('SearchedImg').src = "error.png";
                //clear list
                for (i = 1; i <= 4; i++) {
                    document.getElementById(`SearchedInfo${i}`).innerHTML = "";
                }
            }
        })
    return false;
}


//set number of pinned locations to 0 on page load
var NumPinnedLocations = 0;
//this function pins the searched location to the list of favourite locations
function PinLocation() {

    console.log(NumPinnedLocations);
    //save values of the searched location into variables so they can be added to a pinned location
    SearchTitle = document.getElementById('SearchedTitle').innerHTML;
    SearchImg = document.getElementById('SearchedImg').src;
    SearchInfo1 = document.getElementById('SearchedInfo1').innerHTML;
    SearchInfo2 = document.getElementById('SearchedInfo2').innerHTML;
    SearchInfo3 = document.getElementById('SearchedInfo3').innerHTML;
    SearchInfo4 = document.getElementById('SearchedInfo4').innerHTML;

    //add a location if max limit is not exceeded
    if (NumPinnedLocations < 2) {
        //create a html elements for a new card including title, img and ul and set their values
        let NewPinnedLocation = document.createElement("div");
        NewPinnedLocation.setAttribute("id", "SearchedLocation");
        NewPinnedLocation.setAttribute("class", `PinnedLocation${NumPinnedLocations}`)
        NewPinnedLocation.style.display = "block";

        let PinnedTitle = document.createElement("h1");
        PinnedTitle.setAttribute("id", "SearchedTitle");
        PinnedTitle.innerHTML = SearchTitle;

        let PinnedImg = document.createElement("img");
        PinnedImg.setAttribute("id", "SearchedImg");
        PinnedImg.src = SearchImg;

        let PinnedUl = document.createElement("ul");
        PinnedUl.setAttribute("id", "SearchedList")

        let PinnedLi1 = document.createElement("li");
        PinnedLi1.setAttribute("id", "SearchedInfo1");
        PinnedLi1.innerHTML = SearchInfo1;

        let PinnedLi2 = document.createElement("li");
        PinnedLi2.setAttribute("id", "SearchedInfo2");
        PinnedLi2.innerHTML = SearchInfo2;

        let PinnedLi3 = document.createElement("li");
        PinnedLi3.setAttribute("id", "SearchedInfo3");
        PinnedLi3.innerHTML = SearchInfo3;

        let PinnedLi4 = document.createElement("li");
        PinnedLi4.setAttribute("id", "SearchedInfo4");
        PinnedLi4.innerHTML = SearchInfo4;

        //append the li to the ul, then the title, img and ul to the pinnedlocation card
        PinnedUl.appendChild(PinnedLi1);
        PinnedUl.appendChild(PinnedLi2);
        PinnedUl.appendChild(PinnedLi3);
        PinnedUl.appendChild(PinnedLi4);

        NewPinnedLocation.appendChild(PinnedTitle);
        NewPinnedLocation.appendChild(PinnedImg);
        NewPinnedLocation.appendChild(PinnedUl);

        //pin the location to the list of favourite locations
        let FavouriteLocations = document.getElementById("FavouriteLocations");
        FavouriteLocations.appendChild(NewPinnedLocation);

        NumPinnedLocations = NumPinnedLocations + 1;

    } else {}
}

//this function deletes the last pinned location in the list
function DeleteLocation() {
    //uses jquery to delete by class name
    if (NumPinnedLocations == 3) {
        $(".PinnedLocation2").remove();
    } else if (NumPinnedLocations == 2) {
        $(".PinnedLocation1").remove();
    } else if (NumPinnedLocations == 1) {
        $(".PinnedLocation0").remove();
    }
    if (NumPinnedLocations > 0) {
        NumPinnedLocations = NumPinnedLocations - 1;
    }
}