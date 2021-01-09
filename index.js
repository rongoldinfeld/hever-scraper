const browserObject = require('./browser');
const scraperController = require('./page-controller');

// check for environment variables
if (!process.env.username || !process.env.password || !process.env.url || !process.env.foodDudeToken) {
  throw new Error('process env requires 3 variables, username, password, url, foodDudeToken')
}


//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
scraperController(browserInstance)

/* -------------DELETE ALL---------------------*/

// const axios = require('axios');
// const config = {
//   headers: {Authorization: `Bearer ${process.env.foodDudeToken}`}
// };
// (async () => {
//   const restaurants = await axios.get(
//       'https://food-dude.herokuapp.com/restaurants',
//       config
//   );
//
//   await Promise.all(restaurants.data.map(r =>
//       axios.delete(
//           'https://food-dude.herokuapp.com/restaurants/' + r._id,
//           config
//       ).then(() => console.log(`${r._id} deleted`))));
// })();
