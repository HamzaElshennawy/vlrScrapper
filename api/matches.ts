import puppeteer from "puppeteer";
import { promises as fs } from "fs";

interface MatchData {
    id: string;
    team1: string;
    team1Score: string;
    team2Score: string;
    team2: string;
    event: string;
    type: "result" | "live" | "Upcoming";
}

async function scrapeMatchesUpcoming(): Promise<MatchData[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.goto("https://www.vlr.gg/matches/", {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        // wait for the match cards
        await page.waitForSelector(".wf-card a.match-item", { timeout: 10000 });

        const matches = await page.evaluate(() => {
            const matchElements = document.querySelectorAll(
                ".wf-card a.match-item"
            );
            const results: MatchData[] = [];

            matchElements.forEach((match) => {
                const link = match.getAttribute("href");
                if (!link) return;

                const idMatch = link.match(/\/(\d+)\//);
                const id = idMatch ? idMatch[1] : "";

                const teamEls = match.querySelectorAll(
                    ".match-item-vs-team-name .text-of"
                );
                const team1 = teamEls[0]?.textContent?.trim() || "";
                const team2 = teamEls[1]?.textContent?.trim() || "";

                const team1Score =
                    match
                        .querySelectorAll(".match-item-vs-team-score")[0]
                        ?.textContent?.trim()
                        .replace("–", "-") || "";
                const team2Score =
                    match
                        .querySelectorAll(".match-item-vs-team-score")[1]
                        ?.textContent?.trim()
                        .replace("–", "-") || "";

                const event =
                    match
                        .querySelector(".match-item-event")
                        ?.textContent?.replace(/[\n\t\r]+/g, " ")
                        .trim()
                        .replace("–", "-") || "";

                // Determine type
                let type: "result" | "live" | "Upcoming" = "Upcoming";
                if (match.querySelector(".ml.mod-live")) {
                    type = "live";
                } else if (match.querySelector(".match-item-vs-team-score")) {
                    // if scores are filled in, it means result
                    const scores = Array.from(
                        match.querySelectorAll(".match-item-vs-team-score")
                    ).map((el) => el.textContent?.trim());
                    if (scores.some((s) => s && s !== "")) type = "Upcoming";
                }

                results.push({
                    id,
                    team1,
                    team1Score,
                    team2Score,
                    team2,
                    event,
                    type,
                });
            });

            return results.slice(0, 20); // first 20 matches
        });

        return matches;
    } catch (error) {
        console.error("Error scraping match list:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function scrapeMatchesResults(): Promise<MatchData[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.goto("https://www.vlr.gg/matches/results", {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        // wait for the match cards
        await page.waitForSelector(".wf-card a.match-item", { timeout: 10000 });

        const matches = await page.evaluate(() => {
            const matchElements = document.querySelectorAll(
                ".wf-card a.match-item"
            );
            const results: MatchData[] = [];

            matchElements.forEach((match) => {
                const link = match.getAttribute("href");
                if (!link) return;

                const idMatch = link.match(/\/(\d+)\//);
                const id = idMatch ? idMatch[1] : "";

                const teamEls = match.querySelectorAll(
                    ".match-item-vs-team-name .text-of"
                );
                const team1 = teamEls[0]?.textContent?.trim() || "";
                const team2 = teamEls[1]?.textContent?.trim() || "";

                const team1Score =
                    match
                        .querySelectorAll(".match-item-vs-team-score")[0]
                        ?.textContent?.trim() || "";
                const team2Score =
                    match
                        .querySelectorAll(".match-item-vs-team-score")[1]
                        ?.textContent?.trim() || "";
                const event =
                    match
                        .querySelector(".match-item-event")
                        ?.textContent?.replace(/[\n\t\r]+/g, " ")
                        .trim()
                        .replace("–", "-") || "";

                // Determine type
                let type: "result" | "live" | "Upcoming" = "Upcoming";
                if (match.querySelector(".ml.mod-live")) {
                    type = "live";
                } else if (match.querySelector(".match-item-vs-team-score")) {
                    // if scores are filled in, it means result
                    const scores = Array.from(
                        match.querySelectorAll(".match-item-vs-team-score")
                    ).map((el) => el.textContent?.trim());
                    if (scores.some((s) => s && s !== "")) type = "result";
                }

                results.push({
                    id,
                    team1,
                    team1Score,
                    team2Score,
                    team2,
                    event,
                    type,
                });
            });

            return results.slice(0, 20); // first 20 matches
        });

        return matches;
    } catch (error) {
        console.error("Error scraping match list:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        console.log("Fetching latest 20 matches...");
        const matchesUpcoming = await scrapeMatchesUpcoming();

        console.log("\n=== MATCHES ===\n");
        matchesUpcoming.forEach((m) => {
            console.log(
                `[${m.type}] ${m.team1} vs ${m.team2} (${m.event}) - ID: ${m.id}`
            );
        });

        await fs.writeFile(
            "vlr_matches.json",
            JSON.stringify(matchesUpcoming, null, 2)
        );

        const matchesResults = await scrapeMatchesResults();
        console.log("\n=== MATCHES RESULTS ===\n");
        matchesResults.forEach((m) => {
            console.log(
                `[${m.type}] ${m.team1} vs ${m.team2} (${m.event}) - ID: ${m.id}`
            );
        });

        await fs.writeFile(
            "vlr_matches_results.json",
            JSON.stringify(matchesResults, null, 2)
        );
        console.log("Saved to vlr_matches.json");
    } catch (err) {
        console.error("Failed:", err);
    }
}

if (require.main === module) {
    main();
}

export { scrapeMatchesUpcoming, scrapeMatchesResults, MatchData };
