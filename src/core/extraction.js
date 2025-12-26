import { readFile } from "fs/promises";
import { parse } from "acorn";

// const filePath = "./index.js";
// our data object that we'll export

const data = [];

async function bringLink(code, start, end)
{
    const functionCode = code.slice(start, end);    

    console.log("Analyzing Code Chunk:", functionCode);

    // Matches: res.send("hello")  OR  res.sendFile(path.join(..., "index.html"))
    const regex = /res\.(?:send|sendFile|render)\s*\(\s*(?:path\.join\s*\([^)]*,\s*)?['"`](.*?)['"`]/;


    //! currently it cannot differentiate between real code and comment

        
    const match = functionCode.match(regex);
        
    let targetLink = "Unknown/Dynamic";
    if (match && match[1]) 
    {
        targetLink = match[1]; // The part inside the quotes
    }

    return targetLink;

}


export async function parseFile()
{
  try 
  {
    //* 1. Read the file content as a string
    const code = await readFile(filePath, "utf8");

    //* 2. Pass the string to Acorn
    const ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module", // Required if the file uses import/export
    });

    // console.log(ast);

    // console.log(typeof(ast));


    const elements = ast.body;

    const HTTPverbs = ["get", "post", "use"];

    for(const el of elements)
    {
        if(el.type == "ExpressionStatement")
        {            
            // console.log(el?.expression?.type);
            // console.log(el?.expression?.callee?.type);
            // console.log(el?.expression?.callee?.property?.name);
            // console.log(el?.expression?.arguments[0]?.type, "\n");

            let expressionType = el?.expression?.type || true;
            let calleeType = el?.expression?.callee?.type || true;
            let calleePropertyName = el?.expression?.callee?.property?.name || true;
            let argumentsLiteralName = el?.expression?.arguments?.[0]?.type || true;

            if(expressionType == "CallExpression" && calleeType == "MemberExpression" && HTTPverbs.includes(calleePropertyName) && argumentsLiteralName == "Literal")
            {
                // therefore it's a valid surface

                const linkage = el?.expression?.arguments[0]?.value || null;

                console.log(linkage);

                // const targetLink:
                // arguments -> arrowFunctionExpression -> body : CallExpression / BlockStatement  -> body (or body -> body) -> ExpressionStatement -> expression : CallExpression -> callee.object.name = res & callee.property.name = send/sendFile  --> argument.callExpression.argument.Literal.value is the file being sent 

                //instead of this, used AST for a little more to find the start and end of the argument's arrowFunction's body, and then extract that text and use regex to get the targetLink
                const arrowFunc = el?.expression?.arguments?.[1];
                let arrowFuncStart = arrowFunc.body.start;
                let arrowFuncEnd = arrowFunc.body.end;

                const targetLink = await bringLink(code, arrowFuncStart, arrowFuncEnd);
                
                const routeData = 
                {
                    endpoint : linkage,
                    target : targetLink
                };
                data.push(routeData);
            }
            
        }

    }

  }
  catch (err) 
  {
    console.error("Error reading or parsing file:", err);
  }
}

parseFile();