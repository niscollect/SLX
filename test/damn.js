//?---------------- A basic understanding of terms ---------------------
//* MemberExpression accesses a property or method of an object
//* CallExpression executes a function or method

//?---------------------------------------------------------------------

import { readFile } from "fs/promises";
import { parse } from "acorn";
import * as walk from "acorn-walk";

const filePath = "./index.js"

// our data object that we'll export
const routes = [];


function extractLiteralsFromNode(node) {
    const literals = [];
    
    walk.simple(node, {
        Literal(literalNode) {
            if (typeof literalNode.value === "string") {
                literals.push(literalNode.value);
            }
        }
    });
    
    return literals;
}


function extractMethodName(callee)
{
    // Base case: if it's a MemberExpression, return the property name
    if (callee.type === "MemberExpression") {
        return callee.property.name;
    }
    
    // Recursive case: if it's a CallExpression, look at its callee
    if (callee.type === "CallExpression") {
        return extractMethodName(callee.callee);
    }
    
    // If we can't extract a method name, return null
    return null;
}

function extractFileFromHandler(handlerBody) 
{
    const RESPONSE_METHODS = ["send", "sendFile", "render", "json"];
    const FILE_EXTENSIONS = [".html", ".ejs", ".xml", ".pug", ".hbs", ".jade"]; // possibly the presentable files

    let extractedFile = null;

    walk.simple(handlerBody, {
        
        CallExpression(callNode)
        {
            // Extract method name from callee (handles nested cases)
            let methodName = extractMethodName(callNode.callee);

            // if(callNode.callee.type === "MemberExpression")
            //     methodName = callNode.callee.property.name;
            // covered this case in the extractMethodName function

            // Just Skip if method name doesn't match eligible ones, or is empty
            if(!methodName || !RESPONSE_METHODS.includes(methodName))
                return;

            // Now, look for Literals in the arguments
            callNode.arguments.forEach(arg => {

                const foundLiterals = extractLiteralsFromNode(arg);

                // if(arg.type === "Literal" && typeof(arg.value) === "string")
                // { // may be we are close
                //     console.log("here", arg.value);
                foundLiterals.forEach(literal => {
                    // Remove surrounding quotes if they exist (both ' and ")
                    // let cleanName = arg.value.replace(/['"]+/g, '');   
                    let cleanName = literal.replace(/['"]+/g, '').split(/[?#]/)[0].trim();
                    //check if the literals end with any eligible extensions, i.e. is an eligible presentable file
                    if(FILE_EXTENSIONS.some(ext => cleanName.endsWith(ext)))
                    {
                        console.log("arg value log", literal);
                        extractedFile = literal;
                    } 

                });
                // }
            });
        }
    });

    console.log(extractedFile, "---");
    return extractedFile;
}


function walker(node)
{
    const HTTP_VERBS = ["get", "post", "put", "delete", "use"];
    
    walk.simple(node, {
        CallExpression(callNode)
        {    
            // Step 1: Filter only CallExpressions with MemberExpression callee
            if (callNode.callee.type !== "MemberExpression") return;

            // Step 2: Check if property name is an HTTP verb
            const methodName = callNode.callee.property.name;
            if (!HTTP_VERBS.includes(methodName)) return;

            // Step 3: Reject if less than 2 arguments (need path + handler minimum), for it to be an express route
            if (callNode.arguments.length < 2) return;
            
            // Step 4: Extract literals and arrow functions
            const path = callNode.arguments[0];
            const handler = callNode.arguments[1];

            // Only process if path is a Literal 
            if (path.type !== "Literal") return;  //! only literals for now. We'll build for betterment and more cases, later on

            // Only process if handler is an ArrowFunctionExpression
            if (handler.type !== "ArrowFunctionExpression") return;  //! only arrowFunctions for now. We'll build for betterment and more cases, later on


            //* Branch-1: Walking arrow function body
            // Step 5: Extract file from handler body
            const file = extractFileFromHandler(handler.body);
            console.log("\n\t\t", file, "\t\t", typeof(file), "\n")




            // If we reach here, it's possibly a valid route
            routes.push({
                method: methodName,
                path: path.value,
                file: file || null
            });

            console.log(`✓ Found route: ${methodName.toUpperCase()} ${path.value}`);

        }
    })
}


async function parseFile() 
{
    //* 1. Read the file content as a string
    const code = await readFile(filePath, "utf8");

    //* 2. Pass the string to Acorn
    const ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module", // Required if the file uses import/export
    });

    //@note : We are only looking for express routes

    // await walker(ast);
    walker(ast);

    console.log("\n=== Extracted Routes ===");

    // console.log(JSON.stringify(, null, 2));

    let Routesobj = routes.map(r => ({method: r.method, path: r.path, file: r.file }))

    const jsonString = JSON.stringify(Routesobj, null, 2);

    console.log(jsonString);
}

await parseFile();
// console.log(data);
