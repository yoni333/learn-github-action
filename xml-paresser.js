
// import File System Module 
import { log } from "console";
import fs from "fs";  
  
// import xml2js Module 
import { parseString } from "xml2js";  
 
const projectFolder = process.argv[2]
const  NEW_POM = "pom.xml"
const OLD_POM = "pom_old.xml"

const newPom = fs.readFileSync(
    "./" +  NEW_POM,

    (err) =>{ console.log(err ? 'Error :' + err : 'ok') }
).toString();

const oldPom = fs.readFileSync(
    "./" +  OLD_POM,

    (err) =>{ console.log(err ? 'Error :' + err : 'ok') }
).toString();
log('new pom',newPom);
log('old pom',oldPom);
//xml data 
var xmldata = '<?xml version=”1.0" encoding=”UTF-8"?>' + 
'<Student>' + 
    '<PersonalInformation>' + 
        '<FirstName>Sravan</FirstName>' + 
        '<LastName>Kumar</LastName>' + 
        '<Gender>Male</Gender>' + 
    '</PersonalInformation>' + 
    '<PersonalInformation>' + 
        '<FirstName>Sudheer</FirstName>' + 
        '<LastName>Bandlamudi</LastName>' + 
        '<Gender>Male</Gender>' + 
    '</PersonalInformation>' + 
'</Student>'; 
  
// parsing xml data 
parseString(xmldata, function (err, results) { 
  
// parsing to json 
let data = JSON.stringify(results) 
  
// display the json data 
console.log("results",data); 
});


const result = [];
const compareDeps = p => {
    console.log(`Comparing ${p.name}`);
    console.log();

    const pDependencies = {
        ...(p.dependencies || {}),
        ...(p.devDependencies || {})
    };

    for (const p2 of packages) {
        if (p2.dependencies) {
            const p2Dependencies = {
                ...p2.dependencies,
                ...p2.devDependencies
            };

            for (const d of Object.keys(p2Dependencies)) {
                if (pDependencies[d] && pDependencies[d] !== p2Dependencies[d]) {
                    result.push(`${projectFolder},${d},${pDependencies[d]}`.replace("^", "").replace("~", ""))
                    console.log(`* Dependency ${d} differs:
                                ${p.name}: ${pDependencies[d]}
                                ${p2.name}: ${p2Dependencies[d]}`);
                }
            }
        }
    }
    console.log();
    console.log();
};

while (packages.length > 0) {
    console.log();
    const p = packages.pop();

    compareDeps(p);
}

console.log(result.toString());
require("fs").writeFile(
    "./" + projectFolder+ "_package-json-update.csv",
    result.join('\n'),
    (err) =>{ console.log(err ? 'Error :' + err : 'ok') }
);