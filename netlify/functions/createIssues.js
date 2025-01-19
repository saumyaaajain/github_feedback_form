// netlify/functions/createIssue.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Only POST requests allowed' })
        };
    }

    // 1. Parse form data (JSON payload) from the request
    const { name, email, message } = JSON.parse(event.body);

    // 2. Prepare the issue title and body
    const title = `New Feedback from ${name}`;
    const body = `
**Name**: ${name}
**Email**: ${email}
**Message**: ${message}
  `;

    // 3. Use your environment variable for the GitHub token
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;

    try {
        // 4. Create the issue
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating issue:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify(errorData)
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Enable CORS
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                success: true,
                issueNumber: data.number,
                issueUrl: data.html_url
            })
        };
    } catch (err) {
        console.error('Server error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server Error', error: err.toString() })
        };
    }
};