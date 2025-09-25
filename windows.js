const { Builder, By, Key, until } = require('selenium-webdriver');

// Ask the user which kick channel to extract
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the kick channel URL (e.g., https://kick.com/username or username): ', async (channelUrl) => {
    readline.close();

    // Extract username from URL if full URL is provided
    const username = channelUrl.includes('kick.com') ? channelUrl.split('/').pop() : channelUrl;

    // Initialize the WebDriver
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Navigate to the kick channel
        await driver.get(`https://kick.com/${username}`);

        // Maximize the window
        await driver.manage().window().maximize();

        // Wait for 5 seconds to allow the page to load
        await driver.sleep(5000);

        // Accept cookies if the prompt appears
        try {
            // Wait for the cookie button to be visible and clickable
            let acceptButton = await driver.wait(
                until.elementLocated(By.css('button[data-testid="accept-cookies"]')),
                5000 // Wait up to 5 seconds
            );
            await driver.wait(until.elementIsVisible(acceptButton), 5000);
            await acceptButton.click();
            console.log('Accepted cookies.');
        } catch (e) {
            console.log('No cookie prompt found or failed to click:', e.message);
        }

    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        // Quit the driver
        // await driver.quit();
    }
});