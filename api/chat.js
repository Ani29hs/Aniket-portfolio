export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { messages } = await req.json();

        // Check if API key is configured in Vercel
        if (!process.env.GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "GROQ_API_KEY is not set in Vercel Environment Variables." }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                stream: true
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            return new Response(JSON.stringify({ error: `Groq API Error: ${groqResponse.status} - ${errorText}` }), { 
                status: groqResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Return the stream directly to the client
        return new Response(groqResponse.body, {
            headers: { 'Content-Type': 'text/event-stream' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
