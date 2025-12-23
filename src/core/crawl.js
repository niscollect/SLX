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

    // synchronous VERY VERY BAD CHOICE
    // sequential async  Simple/safer that the above   NOT A GOOD CHOICE
    // parallel async  NOT A GOOD CHOICE
    // bounded parallelism (BATCHED) batches of files  REALLY GOOD CHOICE

    

    // try 
    // {
        // let files = await readdir(rootDir);


        // console.log("==========\n", files, "\n========");

        // for(const item of files) // used for-of and not for-each, coz for-of is async aware and for-each isn't
        // {
            // if(item == "node_modules" || item == ".env" || item == ".gitignore")
            //     continue;

        //     try
        //     {
        //         let tempPath = rootDir + "\\" + item;
        //         let subdirs = await readdir(tempPath);

        //         console.log(`subdirs of ${tempPath} are:`, subdirs);
        //     }
        //     catch(error)
        //     {
        //         if(error.code == "ENOTDIR")
        //         {
        //             console.error(`${item} is a file, not a folder`);
        //         }
        //         else
        //             throw error;
        //     }

            
        // }

    // }
    // catch (error) 
    // {
    //     console.error("Error in accessing files: ", error);
    // }
    

}