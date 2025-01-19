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
    } = process.env;

    // Check if all required environment variables are set
    if (!GITHUB_TOKEN) {
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

        // Create issue body with formatted feedback
        const issueBody = `
### Feedback from Website

**From:** ${name}
**Email:** ${email}

**Message:**
${message}

---
*Submitted via Feedback Form*
`;

        // Create the issue using GitHub API
        const response = await fetch(
            `https://api.github.com/repos/saumyaaajain/github_feedback_form/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Netlify-Function'
                },
                body: JSON.stringify({
                    title: `Feedback from ${name}`,
                    body: issueBody,
                    labels: ['feedback', 'website']
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create GitHub issue');
        }

        const data = await response.json();

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