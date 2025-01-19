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
        let parsedBody;
        try {
            parsedBody = JSON.parse(event.body || '{}');
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid JSON payload' })
            };
        }

        const { name, email, message } = parsedBody;

        // Validate input
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Name, email, and message are required' })
            };
        }

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `Feedback from ${name}`,
                    body: `### Feedback Submission\n**Submitted By:** ${name}\n**Email:** ${email}\n### Message\n${message.trim()}\n---\n\n*Submitted via website feedback form*`,
                    labels: ['feedback', 'website']
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `GitHub API responded with status ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
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