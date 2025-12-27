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
            let expression = el?.expression || false;
            if(!expression || expression?.type != "CallExpression")
                continue;

            let callee = el?.expression?.callee || false;
            if(!callee || callee?.type != "MemberExpression")
                continue;

            let argumentLiteral = el?.expression?.argument?.[0] || false;
            if(!argumentLiteral || argumentLiteral?.type != "Literal")
                continue;
            
            let calleeProperty = callee?.property || false;
            if( !calleeProperty || !HTTPverbs.includes(calleeProperty?.name) )
                continue;

            //** We need to verify callee.object, coz standard javascript methods like map.get(), axios.get(), etc, could trigger false positive, if we just keep looking for .get()
            //* the callee object must be express instance
            let expressionArgument = el.expression?.arguments; // an array
            // We need at least 2 arguments: the route string AND the function
            // We check the last argument to see if it's an ArrowFunctionExpression
            let lastArg = expressionArgument[args.length - 1];
            if( expressionArgument.length < 2 || lastArg?.type != "ArrowFunctionExpression") // the last element of the arguments list, coz there might be middlewares, which we'd want to avoid for now
                continue;

            const linkage = el?.expression?.arguments[0]?.value || null;
            console.log(linkage);

            //*targetLink
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
  catch (err) 
  {
    console.error("Error reading or parsing file:", err);
  }
}

parseFile();