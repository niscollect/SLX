import { opendir } from "fs";
import fs from "fs/promises"

// import { readdir } from "fs/promises";

const setOfAllFiles = new Set();

async function recursiveCrawler(currentPath)
{

    if(currentPath == -1)
        console.log("something's not right with a/some file(s)");

    try 
    {
        const stat = await fs.stat(currentPath);
        
        if (stat.isFile()) 
        {
            // handle file
            setOfAllFiles.add(currentPath);
            console.log(currentPath, "is a file, not a folder");
            return;
        }

        if (!stat.isDirectory()) 
            return -1;

        //* that means it's valid directory
        const entries = await fs.readdir(currentPath);

        for(const entry of entries)
        {
            if(entry == "node_modules" || entry == ".env" || entry == ".gitignore")
                continue;

            let tempPath = currentPath + "\\" + entry;
            await recursiveCrawler(tempPath);
        }
    } 
    catch (error) 
    {
        console.error(error);
    }
}

export async function crawl(rootDir)
{
    console.log(rootDir); // C:\Users\Nishant\Desktop\slx\user_testing_app

    await recursiveCrawler(rootDir);

    console.log("\n\n :::::::: \n\n");

    console.log(setOfAllFiles);

    // ----------------------------------------------------------------------
    // synchronous VERY VERY BAD CHOICE
    // sequential async  Simple/safer that the above   NOT A GOOD CHOICE
    // parallel async  NOT A GOOD CHOICE
    // bounded parallelism (BATCHED) batches of files  REALLY GOOD CHOICE
    // ----------------------------------------------------------------------

    // for easier way to batch, we can just have them as an array, that's the easiest way of having them indexed
    // arrayOfAllFiles = [...setOfAllFiles];  OR
    const arrayOfAllFiles = Array.from(setOfAllFiles);
    
    // so we have an array of all files now
    // now we need to serialize the processing of these files in batches


}