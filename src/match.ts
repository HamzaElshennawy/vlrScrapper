import puppeteer from "puppeteer";

export interface PlayerStats {
    player: string;
    agent: string;
    rating: string;
    acs: string;
    kills: string;
    deaths: string;
    assists: string;
    kd: string;
    adr: string;
    hs: string;
    fk: string;
    fd: string;
}

export interface TeamStats {
    teamName: string;
    score: string;
    ct_rounds: string;
    t_rounds: string;
    ot_rounds: string;
    players: PlayerStats[];
}

export async function scrapeVLRMatch(id: string): Promise<TeamStats[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        const url = `https://www.vlr.gg/${id}`;
        console.log("Navigating to:", url);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        await page.waitForSelector(".vm-stats-container", { timeout: 10000 });

        const statsData = await page.evaluate(() => {
            const container = document.querySelector(".vm-stats-container");
            const teamsnames = container?.querySelectorAll(".team-name");
            const team1Name = teamsnames?.[0]?.textContent
                .replace(/[\n\t\r]+/g, " ")
                .trim();
            const team2Name = teamsnames?.[1]?.textContent
                .replace(/[\n\t\r]+/g, " ")
                .trim();

            const team1Score = container
                ?.querySelectorAll(".score")[0]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();
            const team2Score = container
                ?.querySelectorAll(".score")[1]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();

            const team1CTRounds = container
                ?.querySelectorAll(".mod-ct")[0]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();
            const team1TRounds = container
                ?.querySelectorAll(".mod-t")[0]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();
            const team1OTRounds = container
                ?.querySelectorAll(".mod-ot")[0]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();
            const team2CTRounds = container
                ?.querySelectorAll(".mod-ct")[1]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();
            const team2TRounds = container
                ?.querySelectorAll(".mod-t")[1]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();
            const team2OTRounds = container
                ?.querySelectorAll(".mod-ot")[1]
                ?.textContent.replace(/[\n\t\r]+/g, " ")
                .trim();

            const players: PlayerStats[] = [];
            if (!container) return [];

            const statRows = container.querySelectorAll("tbody tr");
            statRows.forEach((row: Element) => {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 11) {
                    const cleanText = (
                        text: string | null | undefined
                    ): string => (text || "").replace(/[\n\t\r]+/g, " ").trim();

                    const player: PlayerStats = {
                        player: cleanText(cells[0]?.textContent),
                        agent: cleanText(
                            cells[1]?.querySelector("img")?.alt ||
                                cells[1]?.textContent
                        ),
                        rating: cleanText(cells[2]?.textContent),
                        acs: cleanText(cells[3]?.textContent),
                        kills: cleanText(cells[4]?.textContent),
                        deaths: cleanText(cells[5]?.textContent),
                        assists: cleanText(cells[6]?.textContent),
                        kd: cleanText(cells[7]?.textContent),
                        adr: cleanText(cells[8]?.textContent),
                        hs: cleanText(cells[9]?.textContent),
                        fk: cleanText(cells[10]?.textContent),
                        fd: cleanText(cells[11]?.textContent),
                    };
                    players.push(player);
                }
            });

            return [
                {
                    teamName: team1Name || "Team 1",
                    score: team1Score || "",
                    ct_rounds: team1CTRounds || "",
                    t_rounds: team1TRounds || "",
                    ot_rounds: team1OTRounds || "",
                    players: players.slice(0, 5),
                },
                {
                    teamName: team2Name || "Team 2",
                    score: team2Score || "",
                    ct_rounds: team2CTRounds || "",
                    t_rounds: team2TRounds || "",
                    ot_rounds: team2OTRounds || "",
                    players: players.slice(5, 10),
                },
            ];
        });

        return statsData;
    } catch (error) {
        console.error("Error scraping VLR:", error);
        throw error;
    } finally {
        await browser.close();
    }
}
