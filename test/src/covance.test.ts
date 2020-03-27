import { iCore, iCDL } from "@conform/cx-lambda/dist/types/";
import { CdlFileApiService } from "@conform/cx-lambda/dist/service/";
const loadDI = require('../../index.js');
let lambdaPath;

import { expect } from 'chai';
import fs from 'fs';
import _ from 'lodash';
import sinon from 'sinon';

const TIMEOUT = 30 * 1000; // timeout for CML requests
let event;
let emsExpectedResult;
let cdlData;

let container: iCore.Container, cdl: CdlFileApiService;
let lambda, sandbox;

let container_id;
let ext_data;

describe('EMS reporting & logic', () => {
  before(() => {
    require('dotenv').config();
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    container = loadDI('conform5-lambda-integrations-covance');
    lambdaPath = container.get('lambdaPath');
    event = require(lambdaPath + '/fixtures/event.json');
    emsExpectedResult = require(lambdaPath + '/fixtures/emsResult.json');
    cdlData = require(lambdaPath + '/fixtures/cdl.json');
    container_id = _.get(cdlData, "info.parent_id");
    ext_data = _.get(cdlData, "objectDetails.ext_data");

    container.get('awsSecrets').init();
    container.get('appConfig').setEvent(event);
    container.get('appConfig').setCacheControl('');
    lambda = container.get('lambda');
    cdl = container.get('api.cdl');
  });

  afterEach(() => {
    container.get('awsSecrets').done();
  });

  it('file has empty values', async () => {
    const inputFilePath = `${lambdaPath}/fixtures/input/emptyValues.csv`;
    const expectedFilePath = `${lambdaPath}/fixtures/expected/emptyValues.csv`;

    const inStream = fs.createReadStream(inputFilePath);
    const options: iCDL.UploadFileInitParams = {
      container_id,
      name: 'emptyValues.csv',
      ext_data
    };
    const uploadResult = await cdl.uploadStream(inStream, options);
    const { id, version_id } = uploadResult.$object;
    event.body.objectId = id;
    event.body.objectVersionId = version_id;

    sandbox.stub(lambda.logic.validator, 'checkFile').resolves();
    const result = JSON.parse((await lambda.execute(event)).body);
    _.set(result, 'emsData[0].postData.eventCustomProperties.AdditionalInformation', null);
    _.set(result, 'emsData[1].postData.eventCustomProperties.ObjectId', null);

    const file = await cdl.downloadFile(result.objectVersionId);
    const expectedFile = fs.readFileSync(expectedFilePath, 'utf-8');

    expect(result.emsData).to.be.deep.equal(emsExpectedResult.emptyValues);
    expect(file).to.be.deep.equal(expectedFile);
  }).timeout(TIMEOUT*4);

  it('file rows length less than header length', async () => {
    const inputFilePath = `${lambdaPath}/fixtures/input/headerMismatchLess.csv`;
    const expectedFilePath = `${lambdaPath}/fixtures/expected/headerMismatchLess.csv`;

    const inStream = fs.createReadStream(inputFilePath);
    const options: iCDL.UploadFileInitParams = {
      container_id,
      name: 'headerMismatchLess.csv',
      ext_data
    };
    const uploadResult = await cdl.uploadStream(inStream, options);
    const { id, version_id } = uploadResult.$object;
    event.body.objectId = id;
    event.body.objectVersionId = version_id;

    sandbox.stub(lambda.logic.validator, 'checkFile').resolves();
    const result = JSON.parse((await lambda.execute(event)).body);
    _.set(result, 'emsData[0].postData.eventCustomProperties.AdditionalInformation', null);
    _.set(result, 'emsData[1].postData.eventCustomProperties.ObjectId', null);

    const file = await cdl.downloadFile(result.objectVersionId);
    const expectedFile = fs.readFileSync(expectedFilePath, 'utf-8');

    expect(result.emsData).to.be.deep.equal(emsExpectedResult.headerMismatchLess);
    expect(file).to.be.deep.equal(expectedFile);
  }).timeout(TIMEOUT*4);

  it('file rows length grater than header length', async () => {
    const inputFilePath = `${lambdaPath}/fixtures/input/headerMismatchMore.csv`;
    const expectedFilePath = `${lambdaPath}/fixtures/expected/headerMismatchMore.csv`;

    const inStream = fs.createReadStream(inputFilePath);
    const options: iCDL.UploadFileInitParams = {
      container_id,
      name: 'headerMismatchMore.csv',
      ext_data
    };
    const uploadResult = await cdl.uploadStream(inStream, options);
    const { id, version_id } = uploadResult.$object;
    event.body.objectId = id;
    event.body.objectVersionId = version_id;

    sandbox.stub(lambda.logic.validator, 'checkFile').resolves();
    const result = JSON.parse((await lambda.execute(event)).body);
    _.set(result, 'emsData[0].postData.eventCustomProperties.AdditionalInformation', null);
    _.set(result, 'emsData[1].postData.eventCustomProperties.ObjectId', null);
    const file = await cdl.downloadFile(result.objectVersionId);
    const expectedFile = fs.readFileSync(expectedFilePath, 'utf-8');

    expect(result.emsData).to.be.deep.equal(emsExpectedResult.headerMismatchMore);
    expect(file).to.be.deep.equal(expectedFile);
  }).timeout(TIMEOUT*4);

  it('all file rows are correct', async () => {
    const inputFilePath = `${lambdaPath}/fixtures/input/instreamfile.csv`;
    const expectedFilePath = `${lambdaPath}/fixtures/expected/instreamfile.csv`;

    const inStream = fs.createReadStream(inputFilePath);
    const options: iCDL.UploadFileInitParams = {
      container_id,
      name: 'instreamfile.csv',
      ext_data
    };
    const uploadResult = await cdl.uploadStream(inStream, options);
    const { id, version_id } = uploadResult.$object;
    event.body.objectId = id;
    event.body.objectVersionId = version_id;

    sandbox.stub(lambda.logic.validator, 'checkFile').resolves();
    const result = JSON.parse((await lambda.execute(event)).body);
    _.set(result, 'emsData[0].postData.eventCustomProperties.AdditionalInformation', null);
    _.set(result, 'emsData[1].postData.eventCustomProperties.ObjectId', null);    const file = await cdl.downloadFile(result.objectVersionId);
    const expectedFile = fs.readFileSync(expectedFilePath, 'utf-8');

    expect(result.emsData).to.be.deep.equal(emsExpectedResult.instreamfile);
    expect(file).to.be.deep.equal(expectedFile);
  }).timeout(TIMEOUT*4);

  it('file has incorrect header', async () => {
    const inputFilePath = `${lambdaPath}/fixtures/input/incorrectHeader.csv`;

    const inStream = fs.createReadStream(inputFilePath);
    const options: iCDL.UploadFileInitParams = {
      container_id,
      name: 'test_x8888888_lbcaps_cvi_nonsensitive_20191111_allruslan317.txt',
      ext_data
    };
    const uploadResult = await cdl.uploadStream(inStream, options);

    const { id, version_id } = uploadResult.$object;
    event.body.objectId = id;
    event.body.objectVersionId = version_id;

    const result = JSON.parse((await lambda.execute(event)).body);
    _.set(result, 'ems[0].postData.eventCustomProperties.AdditionalInformation', null);

    expect(result.ems).to.be.deep.equal(emsExpectedResult.invalidHeader);
  }).timeout(TIMEOUT*4);

});

