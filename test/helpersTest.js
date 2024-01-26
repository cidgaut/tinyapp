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

//copy past from LLM

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../your_app'); // Import your Express app
const expect = chai.expect;

chai.use(chaiHttp);

describe('URL Access Tests', () => {
  let agent = chai.request.agent(app); // Use chai-http agent to persist cookies

  it('should redirect to login page for "/"', (done) => {
    agent
      .get('http://localhost:3000/')
      .then((res) => {
        expect(res).to.redirectTo('http://localhost:3000/login');
        expect(res).to.have.status(302);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should redirect to login page for "/urls/new"', (done) => {
    agent
      .get('http://localhost:3000/urls/new')
      .then((res) => {
        expect(res).to.redirectTo('http://localhost:3000/login');
        expect(res).to.have.status(302);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return 404 for "/urls/NOTEXISTS"', (done) => {
    agent
      .get('http://localhost:3000/urls/NOTEXISTS')
      .then((res) => {
        expect(res).to.have.status(404);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return 403 for "/urls/b2xVn2"', (done) => {
    agent
      .get('http://localhost:3000/urls/b2xVn2')
      .then((res) => {
        expect(res).to.have.status(403);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  after((done) => {
    // Cleanup after the test (e.g., logout or other necessary steps)
    agent.close(() => {
      done();
    });
  });
});