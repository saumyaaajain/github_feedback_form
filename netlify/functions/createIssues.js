// netlify/functions/create-feedback-issue.js
const { Octokit } = require('@octokit/rest');

exports.handler = async function(event, context) {
    // Environment variables should be set in Netlify UI
    const {
        GITHUB_TOKEN,
        GITHUB_REPO_OWNER,
        GITHUB_REPO_NAME
    } = process.env;

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Check if event.body exists and is not empty
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Request body is empty' })
            };
        }

        let parsedBody;
        try {
            parsedBody = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { name, email, message } = parsedBody;

        // Validate required fields
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Initialize Octokit with your token
        const octokit = new Octokit({
            auth: GITHUB_TOKEN
        });

        // Create the issue
        const response = await octokit.issues.create({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            title: `Feedback from ABC`,
            body: `From: ABC (abc@a.com)\n\nTest hardcoded form feedback`,
            labels: ['feedback']
        });

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Feedback submitted successfully',
                issueUrl: response.data.html_url
            })
        };

    } catch (error) {
        console.error('Error creating issue:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error creating GitHub issue'+error.message,
                details: error.message
            })
        };
    }
};