import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import OpenAI from 'openai';

type ResearchBody = {
  schoolName?: string;
  homeLocation?: string;
  academicInterest?: string;
};

const port = Number(process.env.PORT || 8787);

const sendJson = (res: ServerResponse, status: number, data: unknown) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
};

const readBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString() || '{}') as ResearchBody;
};

const buildPrompt = ({ schoolName, homeLocation, academicInterest }: Required<ResearchBody>) => `
You are helping build a transfer portal college baseball school tracking dashboard.
Research the following college/university and return structured JSON only.

School name: ${schoolName}
Home location for drive time: ${homeLocation}
Academic interest: ${academicInterest}

Find the following information if available:
- Official school name
- City and state
- School website
- Athletics website
- Estimated tuition/cost of attendance
- Whether the school has an undergraduate ${academicInterest} program
- Whether the school has a graduate ${academicInterest} program
- Baseball conference
- NCAA division
- 2026 baseball team record
- Estimated driving time and distance from ${homeLocation}
- Useful notes for a transfer portal baseball player
- Source URLs for important claims

Rules:
- Return JSON only.
- Do not include markdown.
- If a field is uncertain or unavailable, use null or "unknown".
- Do not invent exact tuition, records, or program details.
- Include source URLs when possible.
- Include confidence as High, Medium, or Low.

Expected shape:
{
  "name": "",
  "city": "",
  "state": "",
  "fullLocation": "",
  "schoolWebsite": "",
  "athleticsWebsite": "",
  "tuitionInState": null,
  "tuitionOutOfState": null,
  "estimatedCostOfAttendance": null,
  "costTypeUsed": "unknown",
  "costNotes": "",
  "hasUndergradCS": "unknown",
  "undergradCSProgramName": "",
  "undergradCSUrl": "",
  "hasGradCS": "unknown",
  "gradCSProgramName": "",
  "gradCSUrl": "",
  "baseballConference": "",
  "baseballDivision": "",
  "baseball2026Record": "",
  "baseballRecordSourceUrl": "",
  "driveTimeFromBurlingtonNC": "",
  "driveDistanceFromBurlingtonNC": "",
  "mapsUrl": "",
  "aiResearchSummary": "",
  "aiSources": [{ "title": "", "url": "", "fieldSupported": "" }],
  "confidence": "Medium"
}
`;

const parseJson = (text: string) => {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
};

const fallback = (schoolName: string, reason: string) => ({
  name: schoolName,
  status: 'Not Contacted',
  costTypeUsed: 'unknown',
  hasUndergradCS: 'unknown',
  hasGradCS: 'unknown',
  baseball2026Record: 'Unknown',
  aiResearchSummary: reason,
  aiSources: [],
  confidence: 'Low',
});

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/research-school') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const body = await readBody(req);
    const schoolName = body.schoolName?.trim();
    const homeLocation = body.homeLocation?.trim() || 'Burlington, North Carolina';
    const academicInterest = body.academicInterest?.trim() || 'Computer Science';

    if (!schoolName) {
      sendJson(res, 400, { error: 'School name is required' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      sendJson(res, 200, fallback(schoolName, 'AI research is not configured. Add OPENAI_API_KEY on the server and review this school manually.'));
      return;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: buildPrompt({ schoolName, homeLocation, academicInterest }),
    });

    const parsed = parseJson(result.output_text);
    sendJson(res, 200, {
      ...fallback(schoolName, 'AI research completed. Review all fields before relying on them.'),
      ...parsed,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'School research could not be completed.',
    });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Portal Board research API listening on http://127.0.0.1:${port}`);
});
