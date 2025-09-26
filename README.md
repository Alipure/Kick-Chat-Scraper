# Kick Chat Scraper

A Node.js script that extracts chat messages from a specified Kick.com channel and saves them to a text file. The script uses Selenium WebDriver to scrape messages, including timestamps, usernames, and emotes, while handling dynamic content loading by scrolling the chat.

## Features
- Extracts chat messages from a Kick.com channel.
- Handles emotes by capturing their names (e.g., `[KEKW]`).
- Avoids duplicate messages using a Set data structure.
- Saves messages to a text file in the format: `timestamp username: message`.
- Scrolls the chat to load older messages.
- Counts unique messages and messagers
- [In Progress] Ask the user for a text file name before proceeding

## Requirements
- **Node.js**: Version 14 or higher.
- **Selenium WebDriver**: For browser automation.
- **ChromeDriver**: Must match the installed Chrome browser version.
- **Google Chrome**: A local Chrome binary (path specified in the script).
- **Operating System**: Designed for Linux (adjust paths for other systems).

## Installation

1. **Install Node.js**:
   - Download and install Node.js from [nodejs.org](https://nodejs.org).
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/kick-chat-scraper.git
   cd kick-chat-scraper

   NOTE: MUST INSTALL SELENIUM DRIVER FROM WEBSITE TO OPEN PATH DIRECTORY
