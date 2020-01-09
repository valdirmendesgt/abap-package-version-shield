const handler = require('./handler');

jest.mock('https');
const { PassThrough } = require('stream');
const EventEmitter = require('events');
const https = require('https');
https.get.mockImplementation((url, handler) => {
    const resMock = new PassThrough();
    resMock.statusCode = 200;
    handler(resMock);
    if (url === 'https://raw.githubusercontent.com/sbcgua/mockup_loader/master/src/zif_mockup_loader_constants.intf.abap') {
        resMock.write('interface zif_mockup_loader_constants.');
        resMock.write('  constants version type string value \'v2.1.5\'. "#EC NOTEXT');
        resMock.write('endinterface.');
    }
    resMock.end();

    const reqMock = new EventEmitter();
    return reqMock;
});

describe('test with path params', () => {
    test('should work with normal request', async () => {
        const event = {
            resource: '/get-abap-version-shield-json/{sourcePath}',
            path: '/get-abap-version-shield-json/github/sbcgua/mockup_loader/src/zif_mockup_loader_constants.intf.abap/version',
            pathParameters: {
                sourcePath: 'github/sbcgua/mockup_loader/src/zif_mockup_loader_constants.intf.abap/version'
            },
        };
        const context = {};

        global.console = {
            log: jest.fn(),
            error: jest.fn(),
        };

        await expect(handler.getShieldJson(event, context)).resolves.toEqual({
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'v2.1.5',
                schemaVersion: 1,
                label: 'abap package version',
                color: 'orange',
            }),
        });

        expect(console.log).toHaveBeenNthCalledWith(1, 'Requested path:', event.path);
        expect(console.log).toHaveBeenNthCalledWith(2, 'URL:', 'https://raw.githubusercontent.com/sbcgua/mockup_loader/master/src/zif_mockup_loader_constants.intf.abap');
        expect(console.log).toHaveBeenNthCalledWith(3, 'fetch statusCode: 200');
    });

    test('should fail with wrong request', async () => {
        const event = {
            // resource: '/get-abap-version-shield-json/{sourcePath}',
            // path: '/get-abap-version-shield-json/xxx',
            pathParameters: {
                sourcePath: 'xxx'
            },
        };
        const context = {};

        global.console = {
            log: jest.fn(),
            error: jest.fn(),
        };

        await expect(handler.getShieldJson(event, context)).resolves.toEqual({
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Owner not specified',
            }),
        });
        expect(console.error).toBeCalled();
    });
});
