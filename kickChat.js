const { Builder, By, Key, until } = require('selenium-webdriver');

// Ask the user which kick channel to extract
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the kick channel URL (e.g., https://kick.com/username): ', async (channelUrl) => {
    readline.close();

    // Initialize the WebDriver
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Navigate to the kick channel
        await driver.get(`https://kick.com/${channelUrl}`);

        // Maximize the window
        await driver.manage().window().maximize();

        // Wait for the page to load and display the chat
        await driver.wait(until.elementLocated(By.css('.chat-container')), 10000);


        // Accept cookies if the prompt appears
        // <button class="group inline-flex gap-1.5 items-center justify-center rounded font-semibold box-border relative transition-all betterhover:active:scale-[0.98] disabled:pointer-events-none select-none whitespace-nowrap [&amp;_svg]:size-[1em] outline-transparent outline-2 outline-offset-2 bg-green-500 focus-visible:outline-green-200 text-green-950 [&amp;_svg]:fill-current betterhover:hover:bg-green-600 focus-visible:bg-green-500 disabled:bg-green-800 px-3 py-2 text-lg w-full md:w-auto md:flex-1" dir="ltr" data-testid="accept-cookies">Accept all</button>
        try {
            let acceptButton = await driver.findElement(By.css('button[data-testid="accept-cookies"]'));
            await acceptButton.click();
            console.log('Accepted cookies.');
        } catch (e) {
            console.log('No cookie prompt found.');
        }

        // Scroll to load more messages if necessary
        let lastHeight = await driver.executeScript("return document.querySelector('.chat-container').scrollHeight");
        while (true) {
            await driver.executeScript("document.querySelector('.chat-container').scrollTo(0, document.querySelector('.chat-container').scrollHeight);");
            await driver.sleep(2000); // Wait for new messages to load
            let newHeight = await driver.executeScript("return document.querySelector('.chat-container').scrollHeight");
            if (newHeight === lastHeight) {
                break; // No more new messages
            }
            lastHeight = newHeight;
        }

        


    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Quit the driver
        // await driver.quit();
    }
});