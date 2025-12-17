import { opendir } from "fs";
import fs from "fs/promises"

import { readdir } from "fs/promises";

export async function crawl(rootDir)
{
    console.log(rootDir); // C:\Users\Nishant\Desktop\slx\user_testing_app

    try 
    {
        let files = await readdir(rootDir);

        console.log("==========\n", files, "\n========");

        for(const item of files) // used for-of and not for-each, coz for-of is async aware and for-each isn't
        {
            if(item == "node_modules" || item == ".env" || item == ".gitignore")
                continue;

            try
            {
                let tempPath = rootDir + "/" + item;
                let subdirs = await readdir(tempPath);
            }
            catch(error)
            {
                if(error.code == "ENOTDIR")
                {
                    console.error(`${item} is a file, not a folder`);
                }
                else
                    throw error;
            }

            
        }

    }
    catch (error) 
    {
        console.error("Error in accessing files: ", error);
    }
    

}