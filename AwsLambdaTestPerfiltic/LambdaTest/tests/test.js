const expect = require("chai").expect;
const lambdaTester = require("lambda-tester");

// Import lambda funcion
const lambda = require('../handler.js');

const mockData = {
  // some mock data
  id: 45
}

// Execute lambda function using lambda-tester package
lambdaTester(lambda.handler)
  .event(mockData) // Passing input data
  .expectResult((result) => {
    // Check if code exist
    expect(result.code).to.exist;

    // Check if code = 200
    expect(result.code).to.equal(200);

    // Check if data exist
    expect(result.data).to.exist;

    // Check if data is an array
    expect(result.data).to.be.a("array");

    done();
  })
  .catch((error) => {console.log(error)}); // Catch assertion errors