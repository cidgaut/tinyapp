const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined for an email that does not exist', function() {
    const user = getUserByEmail("nonexistentemail@example.com", testUsers)
    assert.isUndefined(user);
  })
});

//copy paste from LLM
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../express_server'); // Make sure to replace 'express_server' with the correct path to your server file
const expect = chai.expect;

chai.use(chaiHttp);

const agent = chai.request.agent(app);

describe('URL Access Tests', () => {

  let baseUrl;

  before(() => {
    baseUrl = agent.get('').url;  
  });

  it('should redirect to login page for "/"', () => {
    return agent
      .get('/')  // Corrected URL to use port 8080
      .then((res) => {
        expect(res).to.redirectTo(`${baseUrl}/login`);
        expect(res).to.have.status(200);
      });
  });

  it('should redirect to login page for "/urls/new"', () => {
    return agent
      .get('/urls/new')  // Corrected URL to use port 8080
      .then((res) => {
        expect(res).to.redirectTo(`${baseUrl}/login`);
        expect(res).to.have.status(200);
      });
  });

  it('should return 404 for "/urls/NOTEXISTS"', () => {
    return agent
      .get('/urls/NOTEXISTS')  // Corrected URL to use port 8080
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });

  it('should return 403 for "/urls/b2xVn2"', () => {
    return agent
      .get('/urls/b2xVn2')  // Corrected URL to use port 8080
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  after(() => {
    // Cleanup after the test (e.g., logout or other necessary steps)
    agent.close();
  });
});