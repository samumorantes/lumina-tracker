const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(`Status Status: ${res.statusCode}`);
        console.log(`Response Data:\n${data.substring(0, 1000)}`);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(JSON.stringify({ username: "test_script", password: "password", name: "Test" }));
req.end();
