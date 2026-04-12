import fs from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const LOG_DIR = path.resolve(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'llm_logs.json');

// Only try to create directory if not in Vercel
if (!isVercel && !fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error('[LOGGER] Could not create log directory:', err);
  }
}

export function logLLMCall(data: {
  service: 'Gemini' | 'Groq';
  systemPrompt: string;
  userPrompt: string;
  response: string | null;
  error?: any;
  timestamp: string;
}) {
  // Always log to console in production for Vercel logs
  if (isVercel) {
    console.log('[LLM_CALL]', JSON.stringify(data, null, 2));
    return;
  }

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
