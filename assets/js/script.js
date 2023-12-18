
        
// Function 1: Convert from zip code to latitude and longitude
async function convertZipAndFindRestaurantsAndHotels() {
  var zipCode = document.getElementById('zipcodeInput').value;

  try {
      // Convert Zip Code to Latitude and Longitude
      var latLongResponse = await fetch(`https://us-zip-code-information.p.rapidapi.com/?zipcode=${zipCode}`, {
          method: 'GET',
          headers: {
              'X-RapidAPI-Key': '5178754b6emsh6445fe33be0ad04p1b6ff8jsnb551a14e9184',
              'X-RapidAPI-Host': 'us-zip-code-information.p.rapidapi.com'
          }
      });

      if (!latLongResponse.ok) throw new Error(`Error in getting latitude and longitude: ${latLongResponse.statusText}`);

      var latLongData = await latLongResponse.json();
      var { Latitude, Longitude } = latLongData[0];

      // Find Nearby Restaurants
      var restaurantResponse = await fetch(`https://map-places.p.rapidapi.com/nearbysearch/json?location=${Latitude},${Longitude}&radius=1500&type=restaurant`, {
          method: 'GET',
          headers: {
              'X-RapidAPI-Key': '5178754b6emsh6445fe33be0ad04p1b6ff8jsnb551a14e9184',
              'X-RapidAPI-Host': 'map-places.p.rapidapi.com'
          }
      });

      if (!restaurantResponse.ok) throw new Error(`Error in getting restaurants: ${restaurantResponse.statusText}`);

      var restaurantData = await restaurantResponse.json();

      let output = restaurantData.results ? '' : '<p>No restaurants found.</p>';
      restaurantData.results.forEach(restaurant => {
          output += `
            <div class="section-wrapper is-centered columns ">
                <div class="column is-two-third">
                    <div class="restaurant-section box">
                      <p>${restaurant.name}</p>
                    </div>
                </div>

                <div class="column is-one-third">
                  <div class="save-section box has-text-centered" style="text-align: center;">
                      <button onclick="saveRestaurant('${restaurant.name}')">Save</button>
                  </div>
                </div>
            </div>
          `;
      });
      document.getElementById('restaurants').innerHTML = output;

      // Fetch and display hotels
      var today = new Date();
      var tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      var checkInDate = today.toISOString().split('T')[0];
      var checkOutDate = tomorrow.toISOString().split('T')[0];

      var hotelUrl = `https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotelsByLocation?latitude=${Latitude}&longitude=${Longitude}&checkIn=${checkInDate}&checkOut=${checkOutDate}&pageNumber=1&currencyCode=USD&amenities=restaurant`;

      var hotelResponse = await fetch(hotelUrl, {
          method: 'GET',
          headers: {
              'X-RapidAPI-Key': '5178754b6emsh6445fe33be0ad04p1b6ff8jsnb551a14e9184',
              'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
          }
      });

      if (!hotelResponse.ok) throw new Error(`Error in fetching hotels: ${hotelResponse.statusText}`);

      var hotelData = await hotelResponse.json();

      let hotelOutput = hotelData.data.data ? '' : '<p>No hotels found.</p>';
      hotelData.data.data.forEach(hotel => {
          hotelOutput += `
              <div class="hotel-section">
                  <p>${hotel.title} - ${hotel.secondaryInfo}</p>
                  <p>Rating: ${hotel.bubbleRating.rating}, Price: ${hotel.priceForDisplay}</p>
                  <button class="hotel-button" onclick="saveHotel('${hotel.title}')">Save Hotel</button>
              </div>
              
          `;
      });
      document.getElementById('hotels').innerHTML = hotelOutput;

  } catch (error) {
      console.error('Error:', error.message);
      document.getElementById('restaurants').innerHTML += `<p>Error: ${error.message}</p>`;
      document.getElementById('hotels').innerHTML += `<p>Error: ${error.message}</p>`;
  }
}

// Function to save a restaurant and display saved restaurants
function saveRestaurant(restaurantName) {
  let savedRestaurants = JSON.parse(localStorage.getItem('savedRestaurants')) || [];
  if (!savedRestaurants.includes(restaurantName)) {
      savedRestaurants.push(restaurantName);
      localStorage.setItem('savedRestaurants', JSON.stringify(savedRestaurants));
      displaySavedRestaurants();
  } else {
      alert('This restaurant is already saved.');
  }
}

function saveHotel(hotelName) {
  let savedHotels = JSON.parse(localStorage.getItem('savedHotels')) || [];
  if (!savedHotels.includes(hotelName)) {
      savedHotels.push(hotelName);
      localStorage.setItem('savedHotels', JSON.stringify(savedHotels));
      displaySavedHotels();
  } else {
      alert('This hotel is already saved.');
  }
}

// Function to display saved restaurants
function displaySavedRestaurants() {
  let savedRestaurants = JSON.parse(localStorage.getItem('savedRestaurants')) || [];
  let output = '<h2>Saved Restaurants:</h2>';
  if (savedRestaurants.length === 0) {
      output += '<p>No restaurants saved.</p>';
  } else {
      output += '<ul>';
      savedRestaurants.forEach(restaurant => {
          output += `<li>${restaurant}</li>`;
      });
      output += '</ul>';
  }
  document.getElementById('savedRestaurants').innerHTML = output;
}

// Function to display saved hotels
function displaySavedHotels() {
  let savedHotels = JSON.parse(localStorage.getItem('savedHotels')) || [];
  let output = '<h2>Saved Hotels: </h2>';
  if (savedHotels.length === 0) {
      output += '<p>No hotels saved.</p>';
  } else {
      output += '<ul>';
      savedHotels.forEach(hotel => {
          output += `<li>${hotel}</li>`;
      });
      output += '</ul>';
  }
  document.getElementById('savedHotels').innerHTML = output;
}

// Add a button to clear local storage
document.getElementById('removeBtn').addEventListener('click', () => {
    localStorage.clear();
    displaySavedRestaurants();
    displaySavedHotels();
  });

// Initialize the page with saved lists
document.addEventListener('DOMContentLoaded', () => {
  displaySavedRestaurants();
  displaySavedHotels();
});
