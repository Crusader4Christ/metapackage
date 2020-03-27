import { expect } from 'chai';
import { iCore } from '@conform/cx-lambda/dist/types/';
const loadDI = require('../../index.js');
let fixtures;
let container: iCore.Container;

describe('Check-hierarchy Lambda Integration Tests', () => {

  before(() => {
    require('dotenv').config();
  });

  beforeEach(() => {
    container = loadDI('conform5-lambda-integrations-check-hierarchy');
    let lambdaPath = container.get('lambdaPath');
    fixtures = require(lambdaPath + '/fixtures/lambda.json')
  });

  describe('check incoming params', () => {

    it('should throw error if no "divisionid" in query string', async () => {
      const event = fixtures.check_params.no_divisionId.event;
      const actual = await container.get('lambda').execute(event);
      const expected = fixtures.check_params.no_divisionId.expect;
      expect(actual).to.be.deep.equal(expected);
    });

    it('should throw error if no "lifecycle" param in body', async () => {
      const event = fixtures.check_params.no_lifecycle.event;
      const actual = await container.get('lambda').execute(event);
      const expected = fixtures.check_params.no_lifecycle.expect;
      expect(actual).to.be.deep.equal(expected);
    });

  });
});
