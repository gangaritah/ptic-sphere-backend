const axios = require('axios');
const parser = require('lambda-multipart-parser');
var FormData1 = require('form-data');


async function  getResultByIdSubmission(idSubmission){

    return  axios.get(`https://a702eee6.problems.sphere-engine.com/api/v4/submissions?access_token=3162460f0511ecd3a7905a59d86681c3&ids=${idSubmission}`)
    .catch(function (error) {
      return error;
    })

}


async function  getInputsOutputs(url){

    return  axios.get(url)
    .catch(function (error) {
      // handle error
      return error;
    })

}


async function getInputOutputTestCases(cases){
  
    for (let caseTest of cases){
        let index = cases.indexOf(caseTest);
        let output = await getInputsOutputs(`https://a702eee6.problems.sphere-engine.com/api/v4/problems/90043/testcases/${index}/output?access_token=3162460f0511ecd3a7905a59d86681c3`)
        let input = await getInputsOutputs(`https://a702eee6.problems.sphere-engine.com/api/v4/problems/90043/testcases/${index}/input?access_token=3162460f0511ecd3a7905a59d86681c3`)
        caseTest.output = output.data;
        caseTest.input = input.data;
    }
    return cases;
    
}


async function getResultTest(idSubmission){
  
  return new Promise((resolve, reject) => {

      let countAttempts = 0;
      setInterval(async () => {
        if ( countAttempts > 8){
          reject("Timeout");
        }
      
      let att = await getResultByIdSubmission(idSubmission);
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

        let aux = await getInputOutputTestCases(cases)
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

      const getDataEvent = await parser.parse(event);
      const formData = new URLSearchParams();
      formData.append("problemId", getDataEvent.problemId);
      formData.append("source", getDataEvent.source);
      formData.append("compilerId", getDataEvent.compilerId);
      let sendCodeToSphere = await sendTest(formData);
      let resultTest = await getResultTest(sendCodeToSphere.data.id);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
        data: resultTest
        })
    };
    
};