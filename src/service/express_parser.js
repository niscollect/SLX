// before entring here, make sure that the file is express server file
// make a function that can identify if a file is express server file or not
// if it is a server file, send here
// else skip

import { readFile } from "fs/promises";
import { parse } from "acorn";
import * as walk from "acorn-walk";

// const filePath = "./index.js"

// routes are created locally inside `parseFile` to avoid cross-call state
// (no module-level `routes` variable)

function extractLiteralsFromNode(node)
{
    const literals = [];
    
    walk.simple(node, {
        Literal(literalNode)
        {
            if (typeof literalNode.value === "string")
            {
                literals.push(literalNode.value);
            }
        }
    });
    
    return literals;
}

function extractMethodName(callee)
{
    // Base case: if it's a MemberExpression, return the property name
    if (callee.type === "MemberExpression")
    {
        return callee.property.name;
    }
    
    // Recursive case: if it's a CallExpression, look at its callee
    if (callee.type === "CallExpression")
    {
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

            // Just Skip if method name doesn't match eligible ones, or is empty
            if(!methodName || !RESPONSE_METHODS.includes(methodName))
                return;

            // Now, look for Literals in the arguments
            callNode.arguments.forEach(arg => {

                const foundLiterals = extractLiteralsFromNode(arg);


                foundLiterals.forEach(literal => {  
                    let cleanName = literal.replace(/['"]+/g, '').split(/[?#]/)[0].trim();
                    //check if the literals end with any eligible extensions, i.e. is an eligible presentable file
                    if(FILE_EXTENSIONS.some(ext => cleanName.endsWith(ext)))
                    {
                        // console.log("arg value log", literal);
                        extractedFile = literal;
                    } 

                });
            });
        }
    });

    // console.log(extractedFile, "---");
    return extractedFile;
}

function walker(node, routes)
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
            const handler = callNode.arguments[callNode.arguments.length - 1];

            // Only process if path is a Literal 
            if (path.type !== "Literal") return;  //! only literals for now. We'll build for betterment and more cases, later on

            // Only process if handler is an ArrowFunctionExpression
            if (handler.type !== "ArrowFunctionExpression") return;  //! only arrowFunctions for now. We'll build for betterment and more cases, later on


            //* Branch-1: Walking arrow function body
            // Step 5: Extract file from handler body
            const file = extractFileFromHandler(handler.body);
            // console.log("\n\t\t", file, "\t\t", typeof(file), "\n")

            // If we reach here, it's possibly a valid route
            routes.push({
                method: methodName,
                path: path.value,
                file: file || null
            });

            // console.log(`Found route: ${methodName.toUpperCase()} ${path.value}`);
        }
    })
}

async function parseFile(filePath)
{
    //* 1. Read the file content as a string
    const code = await readFile(filePath, "utf8");

    //* 2. Pass the string to Acorn
    const ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module", // Required if the file uses import/export
    });

    //@note : We are only looking for express routes

    // use a local routes array so multiple calls don't share state
    const routes = [];
    // fill routes by walking the AST
    walker(ast, routes);

    // console.log("\n=== Extracted Routes ===");

    // console.log(JSON.stringify(, null, 2));

    let Routesobj = routes.map(r => ({method: r.method, path: r.path, file: r.file }))

    const jsonString = JSON.stringify(Routesobj, null, 2);

    // console.log(jsonString);

    // return the JSON string to callers
    return jsonString;
}

export { parseFile };