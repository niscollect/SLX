import { readFile } from "fs/promises";
import { parse } from "acorn";

import * as walk from "acorn-walk";


const filePath = "./index.js"

// our data object that we'll export
// const data = [];

async function walker(node)
{
    
    walk.recursive(node, {
        // Literal(node)
        // {
        //     console.log("Found a literal:", node.value);
        // }
        //? searching Literals is good, but isn't prudent enough, coz they can even use Identifiers; and we can't keeping looking for both, as they'll then be more than imagination

        //? instead we search for CallExpressions
        CallExpression(node, state, c)
        {
            // inside CallExpression, endpoint can be either an indentifier or a literal
            // currently we'll keep the restriction to look for literals only
            
            // walk.simple(node, {
            //     Literal(node)
            //     {
            //         console.log("==", node.value);
            //     }
            // });


            console.log("Found CallExpression, searching its children for Literals...");
            // walk.recursive(node,{},{
            //     Literal(node)
            //     {
            //         console.log("==", node.value);
            //     },
            //     Expression(node, state, c) {
            //         c(node, state);
            //     }
            // })
            walk.simple(node, {
                Literal(literalNode) {
                    console.log("== Literal found inside Call:", literalNode.value);
                }
            });
        },     
        Expression(node, state, c) {
            c(node, state);
        },
        Statement(node, state, c) {
            c(node, state);
        },
        Program(node, state, c) {
            c(node, state);
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

    await walker(ast);

}

await parseFile();
// console.log(data);