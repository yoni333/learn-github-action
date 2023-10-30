console.log("run test here!!!!!!****")
// const axios = require("axios");
const axios = require('axios');
async function testHTTP (){
res = await axios.get("https://5f1455762710570016b37ea7.mockapi.io/users",{timeout: 3000}).then(function (response) {
    // handle success
    console.log('success');
    console.log(response);
})
    .catch(function (error) {
        // handle error
        console.log("error");
        console.log(error);
    })
    .finally(function () {
        // always executed
    });

    console.log('res',res);

}

testHTTP();