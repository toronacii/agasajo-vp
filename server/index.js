const fs = require('fs');
const readline = require('readline');
// const async = require('async');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile(__dirname + '/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), execute);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

async function execute(auth) {
    const drive = google.drive({ version: 'v3', auth });
    const files = await _execute();
    await createJson(files);

    function _execute(files = [], pageToken = null) {
        return new Promise((resolve, reject) => {
            drive.files.list({
                q: "mimeType='image/jpeg' and '1J6DyrdptoqWnkj5Wg67zmEUiFGu2sGCg' in parents",
                fields: 'nextPageToken, files(id, name)',
                spaces: 'drive',
                pageToken
            }, (err, res) => {
                if (err) return reject(err);
                files.push(...res.data.files);

                // files.forEach(({ id }) => getThumbnail(id).then(result => {
                //     console.log(result);
                // }));

                // getThumbnail(files[0].id).then(result => {
                //     console.log(result);
                // })


                if (res.data.nextPageToken) {
                    return _execute(files, res.data.nextPageToken)
                        .then(resolve);
                }
                return resolve(files);
            });
        })
    }

    function getThumbnail(fileId) {
        return new Promise((resolve, reject) => {
            drive.files.get({
                fileId,
                fields: '*'
            }, (err, result) => {
                if (err) return reject(err);
                return resolve(result.data);
            })
        });
    }
}

function createJson(files) {
    return new Promise((resolve, reject) => {
        const filename = './delegates-web/files.json';
        fs.writeFile(filename, JSON.stringify(files), 'utf8', (err) => {
            if (err) return reject(err);
            return resolve();
        });
    });
}