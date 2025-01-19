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

        // Create issue body
        const issueBody = `
### Feedback from Website

**Submitted By:** ${name}
**Email:** ${email}

### Message
${message}

---
*Submitted via website feedback form*
    `.trim();

        // GitHub API request
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `Feedback from ${name}`,
                    body: issueBody,
                    labels: ['feedback', 'website']
                })
            }
        );

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