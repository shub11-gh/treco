
import fs from 'fs';
import path from 'path';

async function listModels() {
    let apiKey = '';
    try {
        const envContent = fs.readFileSync(path.join(process.cwd(), 'backend', '.env'), 'utf8');
        const match = envContent.match(/GROQ_API_KEY=["']?([^"'\s]+)["']?/);
        if (match) {
            apiKey = match[1];
        }
    } catch (e) {
        console.error("Could not read .env file");
    }

    if (!apiKey) {
        console.error("No API key found");
        return;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error fetching models:", err);
            return;
        }

        const data = await response.json();
        console.log("Supported Models:");
        data.data.forEach(model => {
            console.log(`- ${model.id}`);
        });
    } catch (err) {
        console.error("Failed to list models:", err.message);
    }
}

listModels();
