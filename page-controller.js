const pageScraper = require('./page-scraper');
const axios = require('axios');
const fs = require('fs');

async function scrapeAll(browserInstance) {
  let browser;
  let result;
  try {
    browser = await browserInstance;
    result = await pageScraper(browser);
    browser.close();
    await fs.writeFile("data.json", JSON.stringify(result), err => {
      if (err) {
        return console.log(err);
      }
      console.log("The data has been scraped and saved successfully! View it at './data.json'");
    });
  } catch
      (err) {
    console.log("Could not resolve the browser instance => ", err);
  }

  const config = {
    headers: {Authorization: `Bearer ${process.env.foodDudeToken}`}
  };


  Promise.all(result.map(restaurant => {
    axios.post(
        'https://food-dude.herokuapp.com/restaurants',
        restaurant,
        config
    ).then(() => console.log(`successfully added restaurant ${restaurant.name}`)).catch(err => {
      debugger;
      console.error(err);
    });
  })).then(() => console.log('Done adding to server...'));

}


module.exports = (browserInstance) => scrapeAll(browserInstance)
