import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'llm_logs.json');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function logLLMCall(data: {
  service: 'Gemini' | 'Groq';
  systemPrompt: string;
  userPrompt: string;
  response: string | null;
  error?: any;
  timestamp: string;
}) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      logs = JSON.parse(content);
    }
    
    logs.push(data);
    
    // Keep only last 100 logs
    if (logs.length > 100) logs.shift();
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('[LOGGER] Failed to write logs:', err);
  }
}
