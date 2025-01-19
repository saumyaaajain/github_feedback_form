// netlify/functions/createIssue.js

exports.handler = async function(event, context) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    // Get environment variables
    const {
        GITHUB_TOKEN,
        GITHUB_REPO_OWNER,
        GITHUB_REPO_NAME
    } = process.env;

    // Check environment variables
    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        console.error('Missing required environment variables');
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error' })
        };
    }

    try {
        // Parse the incoming request body
        const { name, email, message } = JSON.parse(event.body);

        // Validate input
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Name, email, and message are required' })
            };
        }

        // Sanitize and format the issue title
        const sanitizedName = name.replace(/[^\w\s-]/g, '').trim();
        const issueTitle = `Website Feedback from ${sanitizedName}`.slice(0, 256);

        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/vnd.github.v3+json");
        myHeaders.append("Authorization", `Bearer ${GITHUB_TOKEN}`);
        myHeaders.append("Content-Type", "application/json");

        const body = JSON.stringify({
            "title": issueTitle,
            "body": `### Feedback Submission\n**Submitted By:** ${sanitizedName}\n**Email:** ${email}\n### Message\n${message.trim()}\n---\n\n*Submitted via website feedback form*`,
            "labels": [
                "feedback",
                "website"
            ]
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: body,
            redirect: 'follow'
        };

        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`, requestOptions)

        const data = await response.json();

        // Check if the response contains an error
        if (!response.ok) {
            console.error('GitHub API Error:', data);
            throw new Error(data.message || 'Failed to create GitHub issue');
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Feedback submitted successfully',
                issueUrl: data.html_url
            })
        };

    } catch (error) {
        console.error('Error creating issue:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to submit feedback',
                error: error.message
            })
        };
    }
};