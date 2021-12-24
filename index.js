const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const cron = require('node-cron')

async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // url reference
    await page.goto('https://learnwebcode.github.io/practice-requests/')

    // take a screenshot from that page and name the image file
    // await page.screenshot({ path: 'amazing.png', fullPage: true })
    // await page.screenshot({ path: 'amazing.png' })

    // Get the name of the images
    const names = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.info strong')).map(
            (x) => x.textContent
        )
    })

    // Write all the name into a name.txt file
    await fs.writeFile('names.txt', names.join('\r\n'))

    // Get the data after click the button which has an id name 'clickme'
    // The data after clicked has an id name 'data'
    await page.click('#clickme')
    const clickData = await page.$eval('#data', (el) => el.textContent)
    console.log(clickData)

    // Get the images
    const photos = await page.$$eval('img', (imgs) => {
        return imgs.map((x) => x.src)
    })

    // button's id and the correct text
    await page.type('#ourfield', 'blue')

    // Wait until the button is clicked and the navigate the page
    await Promise.all([page.click('#ourform button'), page.waitForNavigation()])

    // await page.click('#ourform button')
    // await page.waitForNavigation()

    // Log the info after the button is clicked and the page is navigated
    const info = await page.$eval('#message', (el) => el.textContent)
    console.log(info)

    // scrape the photos
    for (const photo of photos) {
        const imagepage = await page.goto(photo)
        await fs.writeFile(photo.split('/').pop(), await imagepage.buffer())
    }

    // Close the browser other wise the code will run forever
    await browser.close()
}

// Run every 5s
// setInterval(start, 5000)

// cron.schedule('*/5 * * * * *', start)

start()
