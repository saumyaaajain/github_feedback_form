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
        // Safely parse the incoming request body
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

        // Sanitize and format the issue title
        const sanitizedName = name.replace(/[^\w\s-]/g, '').trim();
        const issueTitle = `Website Feedback from ${sanitizedName}`.slice(0, 256);

        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Netlify-Functions'
        };

        const requestBody = {
            title: "Feedback by "+name,
            body: `### Feedback Submission\n**Submitted By:** ${name}\n**Email:** ${email}\n### Message\n${message.trim()}\n---\n\n*Submitted via website feedback form*`,
            labels: ['feedback', 'website']
        };

        await fetch(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            }
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Feedback submitted successfully'
            })
        };

    } catch (error) {
        console.error('Error creating issue:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to submit feedback',
                error: {error: error.message, parsedBody: event.body}
            })
        };
    }
};