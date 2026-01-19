// if file is express server file, send the file to the express crawler
// if it's an html file, send the file to the html crawler

// create a function that can identify if the file is express server file or not
import { parseFile } from "./express_parser.js";
import { readFile } from "fs/promises";


//* redirect the file, to the appropriate crawler/parser
export async function fileRedirector(filePath)
{
    if (!filePath)
        throw new Error("filePath is required");

    const fileContent = await readFile(filePath, "utf-8");

    if (fileContent.includes("express()") || fileContent.includes("require('express')") || fileContent.includes('require("express")'))
    {
        console.log(filePath, " identified as an Express server file.");
        
        // send to express crawler
        const jsonString =  await parseFile(filePath);
        return jsonString;
    }
    else if (filePath.endsWith(".html") || filePath.endsWith(".htm"))
    {
        console.log(filePath, " identified as an HTML file.");
        // send to html crawler (not implemented yet)
        // const jsonString = await htmlParseFile(filePath);
        // return jsonString;
        console.log("HTML parsing not implemented yet.");
        return null;
    }
    else
    {
        console.log(filePath, " is neither an Express server file nor an HTML file. Skipping.");
        return null;
    }
}