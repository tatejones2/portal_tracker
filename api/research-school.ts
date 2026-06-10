import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import OpenAI from 'openai';

if (existsSync('.env')) {
  const envText = readFileSync('.env', 'utf8');
  envText.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const [key, ...valueParts] = trimmed.split('=');
    if (!process.env[key]) {
      process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
    }
  });
}

type ResearchBody = {
  schoolName?: string;
  homeLocation?: string;
  academicInterest?: string;
};

type UserCorrection = {
  schoolPattern: RegExp;
  homePattern: RegExp;
  hasUndergradCS?: true;
  undergradCSProgramName?: string;
  undergradCSUrl?: string;
  driveTimeFromBurlingtonNC?: string;
  driveDistanceFromBurlingtonNC?: string;
  hasGradCS?: 'related';
  gradCSProgramName?: string;
  gradCSUrl?: string;
};

const port = Number(process.env.PORT || 8787);

const userCorrections: UserCorrection[] = [
  {
    schoolPattern: /\bradford university\b/i,
    homePattern: /\bburlington\b.*\bn(?:orth)?\.?\s*c(?:arolina)?\b|\bburlington,\s*nc\b/i,
    hasUndergradCS: true,
    undergradCSProgramName: 'Bachelor of Science in Computer Science',
    undergradCSUrl: 'https://www.radford.edu/content/arts-sciences/home/departments/computer-science/undergraduate-programs.html',
    driveTimeFromBurlingtonNC: '2:26 hrs',
    hasGradCS: 'related',
    gradCSProgramName: 'M.S. in Data and Information Management',
  },
];

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
- Official undergraduate tuition and cost of attendance
- Whether the school has an undergraduate ${academicInterest} program
- Whether the school has a graduate ${academicInterest} program
- Whether the school has a closely related graduate computing/data/information systems program if it does not have an exact graduate ${academicInterest} program
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
- Use web search/tool results when available. Prefer official university, athletics, NCAA/conference, and map sources over memory.
- For estimatedCostOfAttendance, use the official annual out-of-state undergraduate cost of attendance for a residential/on-campus student when available. Do not use tuition-only as estimatedCostOfAttendance.
- Put the academic year and what the cost includes in costNotes. If the official cost page has multiple scenarios and you cannot tell which applies, set estimatedCostOfAttendance to null and explain the options in costNotes.
- For driveDistanceFromBurlingtonNC and driveTimeFromBurlingtonNC, use a maps/directions source when available. If not available, set both to "Unknown" rather than estimating from memory.
- For hasUndergradCS, return true, false, or "unknown".
- For hasGradCS, return true, false, "unknown", or "related".
- Use hasGradCS: "related" when the school has a closely related graduate program but not an exact Computer Science graduate program. Example: M.S. in Data and Information Management should use hasGradCS: "related".
- Format driveTimeFromBurlingtonNC exactly like "2:40 hrs". Do not use "approx", "approximately", "hours", or "minutes".
- Format driveDistanceFromBurlingtonNC like "190 miles". Do not use "approx" or "approximately".
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

const normalizeUnknownBoolean = (value: unknown) => {
  if (value === true || value === false || value === 'unknown' || value === 'related') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['yes', 'true', 'available'].includes(normalized)) return true;
    if (['yes*', 'related', 'closely related', 'adjacent'].includes(normalized)) return 'related';
    if (['no', 'false', 'not available'].includes(normalized)) return false;
  }
  return 'unknown';
};

const sourceText = (sources: unknown) => {
  if (!Array.isArray(sources)) return '';
  return sources
    .map((source) => {
      if (!source || typeof source !== 'object') return '';
      const item = source as Record<string, unknown>;
      return [item.title, item.fieldSupported, item.url].filter((value) => typeof value === 'string').join(' ');
    })
    .join(' ');
};

const extractRelatedGradProgramName = (text: string) => {
  const dataInfoMatch = text.match(/(?:M\.?S\.?|Master of Science)\s+in\s+Data(?:\s+and\s+|\s*&\s*)Information Management/i);
  if (dataInfoMatch) return 'M.S. in Data and Information Management';
  return undefined;
};

const isRelatedGradProgram = (programName: unknown, hasGradCS: unknown, relatedText = '') => {
  if (hasGradCS === 'related') return true;
  const normalized = [typeof programName === 'string' ? programName : '', relatedText].join(' ').toLowerCase();
  const exactComputerScience = /\bcomputer science\b|\bcs\b/.test(normalized);
  if (exactComputerScience && !/\bdoes not offer\b|\bnot offer\b|\bno graduate program in computer science\b/.test(normalized)) return false;
  return /\bdata\b|\binformation\b|\binformatics\b|\bsoftware\b|\bcyber\b|\bcomputing\b|\banalytics\b|\binformation systems\b/.test(normalized);
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeDriveTime = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'unknown') return 'Unknown';

  const existingFormat = trimmed.match(/^(\d+):([0-5]\d)\s*hrs?$/i);
  if (existingFormat) return `${Number(existingFormat[1])}:${existingFormat[2]} hrs`;

  const normalized = trimmed
    .replace(/\bapprox(?:\.|imately)?\b/gi, '')
    .replace(/\bestimated\b/gi, '')
    .replace(/\babout\b/gi, '')
    .trim();
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  const minuteMatch = normalized.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i);

  if (hourMatch) {
    const rawHours = Number(hourMatch[1]);
    const wholeHours = Math.floor(rawHours);
    const decimalMinutes = Math.round((rawHours - wholeHours) * 60);
    const minutes = minuteMatch ? Number(minuteMatch[1]) : decimalMinutes;
    return `${wholeHours}:${String(minutes).padStart(2, '0')} hrs`;
  }

  return normalized;
};

const normalizeDriveDistance = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  return value
    .replace(/\bapprox(?:\.|imately)?\b/gi, '')
    .replace(/\bestimated\b/gi, '')
    .replace(/\babout\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getUserCorrection = (schoolName: string, homeLocation: string) => {
  return userCorrections.find(
    (correction) => correction.schoolPattern.test(schoolName) && correction.homePattern.test(homeLocation),
  );
};

const applyCorrectionSummary = (summary: unknown, schoolName: string, correction?: UserCorrection) => {
  const currentSummary = typeof summary === 'string' ? summary : '';
  if (!correction?.driveTimeFromBurlingtonNC) return currentSummary;

  const cleaned = currentSummary
    .replace(/Radford University offers both undergraduate and graduate programs in Computer Science[^.]*\./gi, 'Radford University offers an undergraduate Computer Science program.')
    .replace(/(?:including|with)\s+a\s+Bachelor[^.]*Master[^.]*\./gi, '')
    .replace(/(?:The\s+)?(?:estimated\s+)?driv(?:e|ing)\s+time[^.]*\./gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const correctionNote = `User-confirmed drive time from home to ${schoolName} is ${correction.driveTimeFromBurlingtonNC}.`;
  const gradNote = correction.gradCSProgramName
    ? `User-confirmed related graduate program: ${correction.gradCSProgramName}.`
    : '';

  return [cleaned, correctionNote, gradNote].filter(Boolean).join(' ');
};

const normalizeResearchResult = (input: Record<string, unknown>, schoolName: string, homeLocation: string) => {
  const costTypeUsed = ['in-state', 'out-of-state', 'unknown'].includes(String(input.costTypeUsed))
    ? input.costTypeUsed
    : 'unknown';
  const confidence = ['High', 'Medium', 'Low'].includes(String(input.confidence)) ? input.confidence : 'Low';

  const hasGradCS = normalizeUnknownBoolean(input.hasGradCS);
  const relatedText = [input.aiResearchSummary, sourceText(input.aiSources)].filter((value) => typeof value === 'string').join(' ');
  const correction = getUserCorrection(String(input.name || schoolName), homeLocation);
  const relatedGradProgramName =
    correction?.gradCSProgramName ??
    (typeof input.gradCSProgramName === 'string' && input.gradCSProgramName.trim()
      ? input.gradCSProgramName
      : extractRelatedGradProgramName(relatedText));
  const relatedGradSource =
    Array.isArray(input.aiSources)
      ? input.aiSources.find((source) => {
          if (!source || typeof source !== 'object') return false;
          const item = source as Record<string, unknown>;
          return String(item.title ?? item.fieldSupported ?? '').toLowerCase().includes('data and information management');
        })
      : undefined;
  const relatedGradUrl =
    correction?.gradCSUrl ??
    (correction?.gradCSProgramName
      ? undefined
      : typeof input.gradCSUrl === 'string' && input.gradCSUrl.trim()
      ? input.gradCSUrl
      : relatedGradSource && typeof (relatedGradSource as Record<string, unknown>).url === 'string'
        ? ((relatedGradSource as Record<string, unknown>).url as string)
        : undefined);
  const hasRelatedGradProgram = isRelatedGradProgram(relatedGradProgramName, hasGradCS, relatedText);

  return {
    ...input,
    tuitionInState: normalizeNumber(input.tuitionInState),
    tuitionOutOfState: normalizeNumber(input.tuitionOutOfState),
    estimatedCostOfAttendance: normalizeNumber(input.estimatedCostOfAttendance),
    costTypeUsed,
    hasUndergradCS: correction?.hasUndergradCS ?? normalizeUnknownBoolean(input.hasUndergradCS),
    undergradCSProgramName:
      correction?.undergradCSProgramName ??
      (typeof input.undergradCSProgramName === 'string' ? input.undergradCSProgramName : undefined),
    undergradCSUrl:
      correction?.undergradCSUrl ?? (typeof input.undergradCSUrl === 'string' ? input.undergradCSUrl : undefined),
    hasGradCS: correction?.hasGradCS ?? (hasRelatedGradProgram ? 'related' : hasGradCS),
    gradCSProgramName: relatedGradProgramName,
    gradCSUrl: relatedGradUrl,
    driveTimeFromBurlingtonNC: correction?.driveTimeFromBurlingtonNC ?? normalizeDriveTime(input.driveTimeFromBurlingtonNC),
    driveDistanceFromBurlingtonNC: correction?.driveDistanceFromBurlingtonNC ?? normalizeDriveDistance(input.driveDistanceFromBurlingtonNC),
    aiResearchSummary: applyCorrectionSummary(input.aiResearchSummary, String(input.name || schoolName), correction),
    confidence,
  };
};

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

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
      sendJson(res, 200, fallback(schoolName, 'AI research is not configured. Add OPENAI_API_KEY on the server and review this school manually.'));
      return;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      temperature: 0,
      tools: [{ type: 'web_search_preview' }],
      input: buildPrompt({ schoolName, homeLocation, academicInterest }),
    });

    const parsed = normalizeResearchResult(parseJson(result.output_text), schoolName, homeLocation);
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
