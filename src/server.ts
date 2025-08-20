import express from "express";
import { scrapeVLRMatch } from "./match";
import { scrapeMatchesUpcoming, scrapeMatchesResults } from "./matches";

const app = express();

app.use(express.json());

app.get("/{id}", (req, res) => {
    const id = req.body.id;
    scrapeVLRMatch(id).then((data) => res.send(data));
});

app.get("/matches/upcoming", (req, res) => {
    scrapeMatchesUpcoming().then((data) => res.send(data));
});

app.get("/matches/results", (req, res) => {
    scrapeMatchesResults().then((data) => res.send(data));
});

app.listen(3000, () => {
    console.log(`Server running on port ${3000}`);
});
