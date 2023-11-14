const { log } = require("console");
const { execSync } = require('child_process');
const {EOL} = require("os");

const  fs  = require("fs")
log()
log("***  find-package-json-different ****")
log()
const FOLDER_LIST = ["assessor_area_ui", "correspondence-area-ui", "cases-ui"];
log("this script update only nodejs projects folder :" + FOLDER_LIST)
log("if you want to add more folder edit the FOLDER_LIST const inside the script")
log()


const compareDeps = (p, packages, projectFolder) => {
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
                    log("found update packages")
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


function loopOverPackages(packages, projectFolder) {
    log("start loop over package.json array")
    while (packages.length > 0) {
        console.log();
        const currentPackage = packages.pop();

        compareDeps(currentPackage, packages, projectFolder);
    }
}

function checkGitDiffFolders(folderPath) {
    log("checking git diff in folder " + folderPath)
    // Replace these with your actual SHA and folder path
    const commitSHA = "HEAD"; // equivalent of github.sha


    const command = `git diff --name-only ${commitSHA} ${commitSHA}~1 -- ${folderPath}`;
    try {
        const output = execSync(command).toString();

        // Check if the output is not empty (i.e., there are changes)
        if (output) {
            console.log(`Changed folders:${EOL}${output}`);
            return true; // There are changes in the folder
        } else {
            return false; // No changes in the folder
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        return false; // Return false in case of an error
    }
}


function packageFileRead(projectFolder) {
    //var projectFolder = process.argv[2]
    // console.log(process.argv)
    console.log(projectFolder);
    const packages = [
        require("./" + projectFolder + "/package.json"),
        require("./" + projectFolder + "/package_old.json"),

    ];

    return packages
}

function writeCSV(result, projectFolder) {
    if (result.length === 0) { log("there is no data to write to CSV"); return }
    log()
    log("write csv")
    console.log(result.map(r=>r));
    fs.writeFileSync(
        "./" + projectFolder+"/"+ "package-json-update.csv",
        result.join(EOL),
        (err) => { console.log(err ? 'Error :' + err : 'ok') }
    );
}


let result = [];
const resultAll = [];

function main() {
    FOLDER_LIST.forEach(folder => {

        if (checkGitDiffFolders(folder)) {
            const packages = packageFileRead(folder)
            loopOverPackages(packages,folder)
            writeCSV(result, folder)
            resultAll.push(...result);
            result= [];
        }


    })

    log(resultAll.map(r=>r))

    writeCSV(resultAll, "")


}


main()