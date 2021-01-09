const areas = require('./areas');

const categories = [
  {
    "_id": "5ff9b8d8f37a2d001eb2956a",

    name: "bar",
    description: "בר|פאב"
  },
  {
    "_id": "5ff9b865f37a2d001eb29569",

    name: "french",
    description: "צרפתי"
  },
  {
    "_id": "5ff9b7c7f37a2d001eb29568",

    description: "מתוקים|קינוחים"
  },
  {
    "_id": "5fd7a57ed13d441ffcc309ac",
    name: "vegetarian!",
    description: "צמחוני|טבעוני"
  },
  {
    "_id": "5fd7a5b7d13d441ffcc309ad",
    name: "italian",
    description: "איטלקי"
  },
  {
    "_id": "5fdb70b3d30eb622d8145230",
    name: "fast food",
    description: "בשרים|דגים"
  },
  {name: 'asian', _id: '5ff9bbd7f37a2d001eb2956b', description: 'אסייתי|אסיאתי|סושי|'},
  {
    name: 'caffe', "_id": "5ff9bc34f37a2d001eb2956c"
    , description: 'קפה|בית קפה'
  }

];
const url = process.env.url;
const username = process.env.username;
const password = process.env.password;


async function scraper(browser) {
  let restaurants = [];
  let page = await browser.newPage();
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  // enter username
  await page.waitForSelector('#tz');
  await page.$eval('#tz', (el, user) => el.value = user, username)
  console.log('Set username to', username)

  // enter password
  await page.waitForSelector('#password');
  await page.$eval('#password', (el, pass) => el.value = pass, password)
  console.log('Set password to', password)

  // login
  await page.waitForSelector('#sgLoginButton');
  await page.$eval('#sgLoginButton', el => el.firstElementChild.click());

  // goto restaurants list
  await page.waitForSelector('img[src="pics/site_home/teamim_card_btn_180220.jpg"]');

  await Promise.all([
    page.waitForNavigation(),
    await page.$eval('img[src="pics/site_home/teamim_card_btn_180220.jpg"]', image => image.click())
  ]);


  await page.waitForSelector('select#area');
  // per area
  for (const area of areas) {
    await page.select('select#area', area.optionName);
    await page.$eval('img[src="static/images/filter_button.png"]', image => image.click());
    await page.waitForSelector('#branch-table tbody');
    let areaRestaurants = await page.$$eval('#branch-table > tbody > tr', (trs, area, categories) => trs.map(tr => {
      function decideCategory(categoryDescription) {
        for (const category of categories) {
          const types = category.description.split('|');
          for (const type of types) {
            if (categoryDescription.includes(type))
              return category._id;
          }
        }
      }

      const name = tr.querySelector('a.link').innerText;
      const rating = Math.floor(Math.random() * (5 - 1 + 1) + 1);
      const description = tr.querySelector('span.small').innerText || 'No description available';
      const imageUrl = tr.querySelectorAll('td')[7].querySelector('img').src
      const rawAddress = tr.querySelectorAll('td')[3].innerText.split('\n')[0].replace(/\(([^)]+)\)/g, '');

      const categoryRawText = tr.querySelectorAll('td')[2].innerText;
      let category = decideCategory(categoryRawText);
      if (!category) {
        console.log(`Was unable to determine restaurant category because text category was ${categoryRawText}, default is ${categories[0].name}`)
        category = categories[0]._id;
      }

      const address = rawAddress.split(',')
      const houseNumberIndex = address[1].lastIndexOf(' ');
      let houseNumber = parseInt(address[1].slice(houseNumberIndex + 1), 10);
      const street = isNaN(houseNumber) ? address[1] : address[1].slice(0, houseNumberIndex);
      if (address[1].match(/\d+\ +$/)) {
        houseNumber = parseInt(address[1].match(/\d+\ +$/)[0], 10)
      }


      return {
        name,
        description,
        imageUrl,
        category,
        rating,
        address: {
          area: area.area,
          city: address[0].trim(),
          street: street.trim(),
          houseNumber: houseNumber || 1
        }
      }
    }), area, categories);
    restaurants.push(areaRestaurants);
  }
  return restaurants.flat();
}

module.exports = scraper;
