
// import File System Module 
import { log } from "console";
import fs from "fs";  
  
// import xml2js Module 
import { parseString } from "xml2js";  
 
const newPom = fs.readFileSync(
    "./" + projectFolder+ "pom.xml",

    (err) =>{ console.log(err ? 'Error :' + err : 'ok') }
).toString();

const oldPom = fs.readFileSync(
    "./" + projectFolder+ "/pom_old.xml",

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