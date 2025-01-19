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
        const { name, email, message } = JSON.parse(event.body);

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
            title: `Feedback from ${name}`,
            body: `From: ${name} (${email})\n\n${message}`,
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
                error: 'Error creating GitHub issue',
                details: error.message
            })
        };
    }
};