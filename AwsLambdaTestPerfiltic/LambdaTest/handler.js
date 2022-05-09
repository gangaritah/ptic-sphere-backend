const axios = require('axios');
const parser = require('lambda-multipart-parser');
var FormData1 = require('form-data');


async function  getRequest(idSubmission){
    return  axios.get(`https://a702eee6.problems.sphere-engine.com/api/v4/submissions?access_token=3162460f0511ecd3a7905a59d86681c3&ids=${idSubmission}`)
    .catch(function (error) {
      // handle error
      return error;
    })
}


async function  getRequest2(url){

    return  axios.get(url)
    .catch(function (error) {
      // handle error
      return error;
    })
}


async function getInputOutput(cases){
  
    for (let caseTest of cases){
        let index = cases.indexOf(caseTest);
        let output = await getRequest2(`https://a702eee6.problems.sphere-engine.com/api/v4/problems/90043/testcases/${index}/output?access_token=3162460f0511ecd3a7905a59d86681c3`)
        let input = await getRequest2(`https://a702eee6.problems.sphere-engine.com/api/v4/problems/90043/testcases/${index}/input?access_token=3162460f0511ecd3a7905a59d86681c3`)
        caseTest.output = output.data;
        caseTest.input = input.data;
    }
    return cases;
    
}


async function getResult(idSubmission){
  
  return new Promise((resolve, reject) => {
    let countAttempts = 0;
    setInterval(async () => {
      if ( countAttempts > 8){
        reject("Timeout");
      }
      let att = await getRequest(idSubmission);
      if (att.status == 200 && att.data.items[0].result.status.code == 15){
        let cases = att.data.items[0].result.testcases;
        
        cases.map(function (case_, index, array) {
                           
                              if (case_.status.name == "wrong answer"){
                                  case_.status.name = "Incorrecto";
                                  return cases;
                                }
                              if (case_.status.name == "accepted"){
                                  case_.status.name = "Correcto";
                                  return cases;
                                }
                              
                      });
        console.log(888888, casesStateToSpanish)
        let aux = await getInputOutput(cases)
        resolve({statusTest: "accepted", data: aux});
      }
      if (att.status == 200 && att.data.items[0].result.status.code == 11){
          resolve({statusTest: "compilation error"});
      }
      countAttempts++
      
    }, 2000)
    
  });
}


async function  sendTest(formData){
    return  axios.post('https://a702eee6.problems.sphere-engine.com/api/v4/submissions?access_token=3162460f0511ecd3a7905a59d86681c3', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .catch(function (error) {
      return error;
    })
}
   
  
  
  
    
module.exports.handler = async event => {

      const result = await parser.parse(event);
      const formData3 = new URLSearchParams();
      formData3.append("problemId", result.problemId);
      formData3.append("source", result.source);
      formData3.append("compilerId", result.compilerId);
      let sphereCode = await sendTest(formData3);
      let result2 = await getResult(sphereCode.data.id);
      return {
        statusCode: 200,
        body: JSON.stringify({
        data: result2
        })
    };
    
};