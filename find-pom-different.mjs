
// import File System Module 
import { log } from "console";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { execSync } from 'child_process';

import { EOL } from "os";

// import xml2js Module 
import { parseString } from "xml2js";
log()
log("***  find-POM-different ****")
log()
const FOLDER_LIST = [
    "shuma_admin",
    "shuma_audit",
    "shuma_bleaching",
    "shuma_camunda",
    "shuma_cases",
    "shuma_config_server",
    "shuma_discovery",
    "shuma_documents",
    "shuma_employee_management",
    "shuma_entirex_api",
    "shuma_error_handling",
    "shuma_infra",
    "shuma_infra-parent",
    "shuma_infra-springboot-parent",
    "shuma_letters",
    "shuma_lm_common",
    "shuma_pdf_generator",
    "shuma_resource_bundle"
];
log("this script update only POM.XML projects folder :" + FOLDER_LIST)
log("if you want to add more folder edit the FOLDER_LIST const inside the script")
log()


function createOldPomXML(folderPath){
    log("createOldPomXML")
    const commitSHA = "HEAD"; // equivalent of github.sha


    const command = `git show  ${commitSHA}~1:${folderPath}/pom.xml > ./${folderPath}/pom_old.xml`;
    try {
        const output = execSync(command).toString();

        // Check if the output is not empty (i.e., there are changes)
        if (output) {
            console.log(`Create old pom.xml${EOL}${output}`);
            return true; // There are changes in the folder
        } else {
            return false; // No changes in the folder
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        console.log("copy pom.xml to old pom");
        const command = `cat ./${folderPath}/pom.xml > ./${folderPath}/pom_old.xml`;
        const output = execSync(command).toString();
        return false; // Return false in case of an error
    }
}



function readAndParsePOM(projectFolder) {

    const NEW_POM_FILE = "pom.xml"
    const OLD_POM_FILE = "pom_old.xml"

    const newPomXML = readFileSync(
        "./" + projectFolder + "/" + NEW_POM_FILE,

        (err) => { console.log(err ? 'Error :' + err : 'ok') }
    ).toString();

    const oldPomXML = readFileSync(
        "./" + projectFolder + "/" + OLD_POM_FILE,

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

    return { newPomJSON, oldPomJSON }
}

const result = [];
const compareDeps = (newPomJSON, oldPomJSON, projectFolder) => {
    console.log(`Comparing ${newPomJSON.project.name}`);


    const newDependencies = manipulateStructure(newPomJSON)
    const oldDependencies = manipulateStructure(oldPomJSON)

    console.log(JSON.stringify(newDependencies));
    console.log(JSON.stringify(oldDependencies));

    for (const d of Object.keys(oldDependencies)) {
        if (newDependencies[d] && oldDependencies[d] && newDependencies[d].version !== oldDependencies[d].version) {
            result.push(`${projectFolder},${newDependencies[d].groupId},${newDependencies[d].artifactId}, ${newDependencies[d].version}`)

            console.log(`* Dependency ${d} differs:
                                ${newDependencies[d].artifactId}: ${newDependencies[d].version}
                                ${oldDependencies[d].artifactId}: ${oldDependencies[d].version}`);
        }
    }
}

function manipulateStructure(pomJson) {

    let dependencyObject = {};
    //  log ('dependencyList',JSON.stringify(  pomJson.project.dependencies))
    if (pomJson.project && pomJson.project.dependencies && pomJson.project.dependencies.length > 0 && pomJson.project.dependencies[0].dependency) {
        let dependencyList = pomJson.project.dependencies[0].dependency;

        // Ensure that dependencyList is an array
        if (!Array.isArray(dependencyList)) {
            dependencyList = [dependencyList];
        }
        //  log ('dependencyList',JSON.stringify(  dependencyList))
        for (let dep of dependencyList) {



            // Use artifactId as the key
            let artifactIdKey = dep.artifactId;
            if (!dep.version) { continue }
            // The value will be an object of the rest of the dependency details
            dependencyObject[artifactIdKey] = {
                groupId: dep.groupId[0],
                version: dep.version[0],
                artifactId: dep.artifactId[0],
                // Include other fields if they exist
            };
        }
    }
    JSON.stringify('dependencyObject', dependencyObject)
    return dependencyObject;
}

function createCSV(result) {
    console.log(result.map(r => r + EOL));
    const res = writeFileSync(
        "./" + "pom-update.csv",
        result.join(EOL),
        (err) => { console.log(err ? 'Error :' + err : 'ok') }
    );

}

function main(projectFolderList) {

    projectFolderList.forEach(projectFolder => {
        if (!existsSync("./" + projectFolder)) { return }
        createOldPomXML(projectFolder)
        const { newPomJSON, oldPomJSON } = readAndParsePOM(projectFolder)
        compareDeps(newPomJSON, oldPomJSON, projectFolder);

    });


    createCSV(result)

}

main(FOLDER_LIST);