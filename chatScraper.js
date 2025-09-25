/*

Kick Chat Scraper
This script extracts chat messages from a specified Kick channel and saves them to a text file.
It handles dynamic content loading by scrolling through the chat and captures messages including emotes.

Requirements:
- Node.js
- Selenium WebDriver
- ChromeDriver
- A local Chrome binary (path specified in the script)

Usage:
1. Ensure you have Node.js installed.
2. Install Selenium WebDriver: npm install selenium-webdriver
3. Download ChromeDriver and ensure it matches your Chrome version.
4. Update the path to your local Chrome binary in the script.
5. Run the script using: node linux.js
6. Enter the Kick channel URL or username when prompted.

Note:   This script is designed for Linux systems. Adjust paths as necessary for other operating systems.
        Selecting elements by CSS classes may be accurate as of 25-9-2025 but could change if Kick updates their site.

*/

const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

// Ask the user which Kick channel to extract
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the Kick channel URL (e.g., https://kick.com/username or username): ', async (channelUrl) => {
    readline.close();

    // Extract username from URL if full URL is provided
    const username = channelUrl.includes('kick.com') ? channelUrl.split('/').pop() : channelUrl;

    // Initialize the WebDriver
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new (require('selenium-webdriver/chrome').Options)().setChromeBinaryPath('/home/single/Documents/Bots/chrome-linux64/chrome')
        )
        .build();

    // Output file
    const chatFile = '/home/single/Documents/Bots/Kick-Chat-Scraper/chat.txt';
    const scrapedMessages = new Set(); // To avoid duplicate messages
    const uniqueUsers = new Set(); // To track unique usernames
    const maxScrolls = 50; // Maximum number of scroll attempts
    const scrollDelay = 2000; // Delay between scrolls (ms)
    const maxMessages = 1000; // Maximum number of messages to collect
    let buffer = 10000;

    try {
        // Navigate to the Kick channel
        await driver.get(`https://kick.com/${username}`);
        console.log(`Navigated to https://kick.com/${username}`);

        // Maximize the window
        await driver.manage().window().maximize();
        console.log('Maximized window.');

        // Wait for 5 seconds to allow the page to load
        await driver.sleep(5000);

        // Accept cookies if the prompt appears
        try {
            let acceptButton = await driver.wait(
                until.elementLocated(By.css('button[data-testid="accept-cookies"]')),
                5000
            );
            await driver.wait(until.elementIsVisible(acceptButton), 5000);
            await acceptButton.click();
            console.log('Accepted cookies.');
        } catch (e) {
            console.log('No cookie prompt found or failed to click:', e.message);
        }

        // Locate the chat container
        let chatContainer = await driver.wait(
            until.elementLocated(By.css('div#chatroom-messages')),
            10000
        );
        console.log('Located chat container.');

        // Scroll and collect messages
        let scrollCount = 0;
        let previousMessageCount = 0;

        while (scrollCount < maxScrolls && scrapedMessages.size < maxMessages) {
            // Get current messages
            let messages = await chatContainer.findElements(By.css('div.betterhover\\:group-hover\\:bg-shade-lower'));
            console.log(`Found ${messages.length} messages on scroll ${scrollCount + 1}`);

            // Extract every message and save to file
            for (let message of messages) {
                try {
                    // Extract timestamp
                    let timestamp = 'Unknown';
                    try {
                        let timestampElement = await message.findElement(By.css('span.text-neutral.pr-1.font-semibold'));
                        timestamp = await timestampElement.getText();
                    } catch (e) {
                        console.log('Timestamp not found, using default:', e.message);
                    }

                    // Extract username
                    let username = 'Unknown';
                    try {
                        let usernameElement = await message.findElement(By.css('button.inline.font-bold'));
                        username = await usernameElement.getAttribute('title');
                        uniqueUsers.add(username); // Add username to Set to track unique users
                    } catch (e) {
                        console.log('Username not found, using default:', e.message);
                    }

                    // Extract message content, including emotes
                    let messageContent = '';
                    try {
                        // Try to get content with emotes
                        let contentElements = await message.findElements(By.css('span[class*="font-normal"] > *'));
                        if (contentElements.length === 0) {
                            // Fallback to raw text if no child elements
                            let textContent = await message.findElement(By.css('span[class*="font-normal"]')).getText();
                            messageContent = textContent;
                        } else {
                            for (let element of contentElements) {
                                let isEmote = await element.getAttribute('data-emote-name');
                                if (isEmote) {
                                    messageContent += `[${isEmote}] `;
                                } else {
                                    let text = await element.getText();
                                    messageContent += text + ' ';
                                }
                            }
                        }
                    } catch (e) {
                        console.log('Content not found, logging HTML for debugging:', e.message);
                        // Log the outer HTML of the message for debugging
                        let html = await message.getAttribute('outerHTML');
                        console.log('Message HTML:', html);
                        continue; // Skip this message
                    }

                    // Combine timestamp, username, and message content
                    let formattedMessage = `${timestamp} ${username}: ${messageContent.trim()}`;

                    // Avoid duplicate messages
                    if (!scrapedMessages.has(formattedMessage) && messageContent.trim() !== '') {
                        scrapedMessages.add(formattedMessage);
                        fs.appendFileSync(chatFile, formattedMessage + '\n', 'utf8');
                        console.log(`Saved: ${formattedMessage}`);
                    }
                } catch (e) {
                    console.error('Error processing a message:', e.message);
                }
            }

            console.log(`==============================`);
            console.log(`Scroll ${scrollCount + 1} complete. Total unique messages so far: ${scrapedMessages.size}`);
            console.log(`Number of unique users: ${uniqueUsers.size}`);
            console.log(`==============================`);

            // Increase buffer time if no new messages were loaded
            if (messages.length === previousMessageCount) {
                buffer += 5000; // Increase buffer by 5 seconds
                console.log('No new messages loaded, increasing buffer to', buffer, 'ms');
            } else {
                buffer = 10000; // Reset buffer to default
            }

            console.log('Waiting for', buffer, 'ms before next scroll...');
            await driver.sleep(buffer);

            previousMessageCount = messages.length;

            // Scroll to the top of the chat container
            await driver.executeScript(`
                const chatContainer = document.querySelector('div#chatroom-messages');
                chatContainer.scrollTop = 0;
            `);

            // Wait for new messages to load
            await driver.sleep(scrollDelay);
            scrollCount++;
        }

        console.log(`Extracted ${scrapedMessages.size} unique messages to ${chatFile}`);
        console.log(`Total unique users: ${uniqueUsers.size}`);
    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        // Quit the driver
        // await driver.quit();
        console.log('Browser closed.');
    }
});