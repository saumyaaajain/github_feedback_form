// netlify/functions/create-issue.js

exports.handler = async function(event, context) {
    // Log the incoming request for debugging
    console.log('Received event:', {
        httpMethod: event.httpMethod,
        headers: event.headers,
        body: event.body
    });

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get environment variables
    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

    // Validate environment variables
    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        console.error('Missing required environment variables');
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Server configuration error' })
        };
    }

    try {
        // Parse and validate request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        let parsedBody;
        try {
            parsedBody = JSON.parse(event.body);
            console.log('Parsed request body:', parsedBody);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.log('Raw body received:', event.body);
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Invalid JSON in request body',
                    details: parseError.message,
                    receivedBody: event.body
                })
            };
        }

        const { name, email, message } = parsedBody;

        // Validate required fields
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Name, email, and message are required' })
            };
        }

        console.log('Making GitHub API request...');

        // Create issue using native https module
        const requestBody = JSON.stringify({
            title: `Feedback from ${name}`,
            body: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            labels: ['feedback']
        });

        // Use native https module
        const https = require('https');

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify Function'
            }
        };

        const githubResponse = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve({ statusCode: res.statusCode, body: data });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(requestBody);
            req.end();
        });

        // Parse GitHub response
        let data;
        try {
            data = JSON.parse(githubResponse.body);
        } catch (parseError) {
            console.error('Error parsing GitHub response:', parseError);
            throw new Error('Invalid response from GitHub API');
        }

        if (githubResponse.statusCode !== 201) {
            console.error('GitHub API error:', data);
            throw new Error(data.message || 'Failed to create GitHub issue');
        }

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Feedback submitted successfully',
                issueUrl: data.html_url
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to submit feedback',
                details: error.message
            })
        };
    }
};