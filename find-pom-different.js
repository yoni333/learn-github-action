
// import File System Module 
import { log } from "console";
import fs from "fs";

// import xml2js Module 
import { parseString } from "xml2js";

const projectFolder = process.argv[2]
const NEW_POM_FILE = "pom.xml"
const OLD_POM_FILE = "pom_old.xml"

const newPomXML = fs.readFileSync(
    "./" + NEW_POM_FILE,

    (err) => { console.log(err ? 'Error :' + err : 'ok') }
).toString();

const oldPomXML = fs.readFileSync(
    "./" + OLD_POM_FILE,

    (err) => { console.log(err ? 'Error :' + err : 'ok') }
).toString();
//xml data 
// log('new pom', newPomXML);
// log('old pom', oldPomXML);


let newPomJSON = {}
let oldPomJSON = {}
// parsing xml data 
parseString(newPomXML, function (err, results) {
    newPomJSON = results
    // display the json data 
  //  console.log("results", JSON.stringify(newPomJSON));
});

parseString(oldPomXML, function (err, results) {
    oldPomJSON = results
    // display the json data 
  //  console.log("results", JSON.stringify(oldPomJSON));
});


const result = [];
const compareDeps = (newPomJSON, oldPomJSON) => {
    console.log(`Comparing ${newPomJSON.project.name}`);


    const newDependencies = manipulateStructure(newPomJSON)
    const oldDependencies = manipulateStructure(oldPomJSON)

    console.log(JSON.stringify( newDependencies));
    console.log(JSON.stringify( oldDependencies));

    for (const d of Object.keys(oldDependencies)) {
        if (newDependencies[d] && oldDependencies[d] &&  newDependencies[d].version !== oldDependencies[d].version) {
            result.push(`${projectFolder},${d},${newDependencies[d].groupId},${newDependencies[d].artifactId}, ${newDependencies[d].version}`)
            
            console.log(`* Dependency ${d} differs:
                                ${newDependencies[d].artifactId}: ${newDependencies[d].version}
                                ${oldDependencies[d].artifactId}: ${oldDependencies[d].version}`);
        }
    }
}




function manipulateStructure(pomJson) {
  
    let dependencyObject = {};
  //  log ('dependencyList',JSON.stringify(  pomJson.project.dependencies))
    if (pomJson.project && pomJson.project.dependencies &&   pomJson.project.dependencies.length > 0 &&  pomJson.project.dependencies[0].dependency) {
        let dependencyList = pomJson.project.dependencies[0].dependency;
    
        // Ensure that dependencyList is an array
        if (!Array.isArray(dependencyList)) {
            dependencyList = [dependencyList];
        }
      //  log ('dependencyList',JSON.stringify(  dependencyList))
        for (let dep of dependencyList) {
         
    

            // Use artifactId as the key
            let artifactIdKey = dep.artifactId;
            if (!dep.version){continue}
            // The value will be an object of the rest of the dependency details
            dependencyObject[artifactIdKey] = {
                groupId: dep.groupId[0],
                version: dep.version[0],
                artifactId: dep.artifactId[0],
                // Include other fields if they exist
            };
        }
    }
    JSON.stringify(dependencyObject)
    return dependencyObject;
}

let poms = [oldPomJSON, newPomJSON] //  new pom always last!



    compareDeps(newPomJSON, oldPomJSON);


console.log(result.toString());
fs.writeFile(
    "./" + projectFolder + "_pom-update.csv",
    result.join('\n'),
    (err) => { console.log(err ? 'Error :' + err : 'ok') }
);