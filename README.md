# VLR Scrapper Project

=========================

## Overview

---

This project is a web scraper built using Node.js, TypeScript, and Puppeteer. It extracts data from the [vlr.gg](https://vlr.gg) website and provides a RESTful API to access the scraped data.

## Features

---

- Scrapes upcoming and recent match data from the [vlr.gg](https://vlr.gg) website
- Provides a RESTful API to access the scraped data
- Uses Puppeteer for headless browser automation
- Built using TypeScript for type safety and maintainability

## API Endpoints

---

### 1. Get Match Data by ID

- **URL:** `/matches/{id}`
- **Method:** `GET`
- **Description:** Retrieves match data for a specific match ID
- **Response:** `TeamStats[]` (see `src/match.ts` for type definition)

### 2. Get Upcoming Matches

- **URL:** `/matches/upcoming`
- **Method:** `GET`
- **Description:** Retrieves a list of upcoming matches
- **Response:** `MatchData[]` (see `src/matches.ts` for type definition)

### 3. Get Recent Matches

- **URL:** `/matches/results`
- **Method:** `GET`
- **Description:** Retrieves a list of recent matches
- **Response:** `MatchData[]` (see `src/matches.ts` for type definition)

## Project Structure

---

- `src/`: Source code directory
    - `server.ts`: Main server file
    - `match.ts`: Match data scraping and processing logic
    - `matches.ts`: Matches data scraping and processing logic
- `dist/`: Compiled JavaScript output directory
- `package.json`: Project metadata and dependencies
- `tsconfig.json`: TypeScript configuration file

## Development

---

### Prerequisites

- Node.js (14.x or higher)
- TypeScript (4.x or higher)
- Puppeteer (10.x or higher)

### Setup

1. Clone the repository: `git clone https://github.com/HamzaElshennawy/vlrScrapper.git`
2. Install dependencies: `npm i`
3. Build the project: `npm run build`
4. Start the server: `npm run dev`

## Contributing

---

Contributions are welcome! Please submit a pull request with a clear description of the changes.

## License

---

This project is licensed under the MIT License.

## Acknowledgments

---

- [Valorant](https://playvalorant.com/)
- [vlr.gg](https://vlr.gg)
- [Puppeteer](https://pptr.dev/) for making headless browser automation easy
