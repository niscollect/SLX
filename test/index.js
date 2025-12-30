import express from "express";

import { reso } from "slx";

const app = express();

const paths = ["/docs/getting-started", "/docs/api", "/pricing"];

app.get("/docs/getting-started", (req, res) => res.send("Getting Started"));

app.get("/docs/api", (req, res) => res.send("API Docs"));

app.get("/pricing", (req, res) => res.send("Pricing"));

app.get('/profile')


app.get('/', (req, res) => {
    // res.send('hello baby')
    res.sendFile(path.join(__dirname, 'index.html'));
})



app.use(reso(paths));

app.listen(3000, () => {
  console.log("Test app running on http://localhost:3000");
});