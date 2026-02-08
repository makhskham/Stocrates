import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

type EventItem = {
  id: string;
  timestamp: string;
  open: number;
  close: number;
  high: number;
  low: number;
  movePercent: number;
  direction: 'up' | 'down';
  pattern: string;
  expectedDirection?: 'up' | 'down';
  eventType?: string;
};

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export async function GET(request: NextRequest) {
  const eventsPath = path.join(process.cwd(), 'lib', 'mock-events.json');
  const raw = fs.readFileSync(eventsPath, 'utf8');
  const allEvents: EventItem[] = JSON.parse(raw);

  // Get filter parameters
  const searchParams = request.nextUrl.searchParams;
  const pattern = searchParams.get('pattern');
  const eventType = searchParams.get('eventType');

  // Filter events by pattern and/or event type
  let events = allEvents;

  if (pattern) {
    events = events.filter(e => e.pattern === pattern);
  }

  if (eventType) {
    events = events.filter(e => e.eventType === eventType);
  }

  const count = events.length;

  // Return error if no events found
  if (count === 0 && (pattern || eventType)) {
    const filters = [];
    if (pattern) filters.push(`pattern: ${pattern}`);
    if (eventType) filters.push(`event type: ${eventType}`);

    return NextResponse.json({
      error: `No events found for ${filters.join(' and ')}`,
      count: 0
    }, { status: 404 });
  }

  const avgMove = mean(events.map((e) => e.movePercent));

  const ranges = events.map((e) => e.high - e.low);
  const avgRange = mean(ranges);

  // Pattern reliability: % of events where actual direction == expectedDirection
  let totalMatches = 0;
  const patternStats: Record<
    string,
    { count: number; matches: number }
  > = {};

  for (const e of events) {
    const p = e.pattern || 'unknown';
    if (!patternStats[p]) patternStats[p] = { count: 0, matches: 0 };
    patternStats[p].count += 1;
    if (e.expectedDirection && e.direction === e.expectedDirection) {
      patternStats[p].matches += 1;
      totalMatches += 1;
    }
  }

  const patternReliabilityByPattern: Record<
    string,
    { count: number; reliability: number }
  > = {};

  for (const k of Object.keys(patternStats)) {
    const s = patternStats[k];
    patternReliabilityByPattern[k] = {
      count: s.count,
      reliability: s.count > 0 ? Number(((s.matches / s.count) * 100).toFixed(2)) : 0,
    };
  }

  const overallPatternReliability = count > 0 ? Number(((totalMatches / count) * 100).toFixed(2)) : 0;

  const eventsCountByPattern: Record<string, number> = {};
  for (const e of events) {
    eventsCountByPattern[e.pattern] = (eventsCountByPattern[e.pattern] || 0) + 1;
  }

  const weights = {
    avgMove: 0.4,
    avgRange: 0.3,
    patternReliability: 0.3,
    explanation:
      'Weights indicate relative importance when combining metrics into a composite score. Adjust as needed.'
  } as const;

  const result = {
    count,
    averageMovePercent: Number(avgMove.toFixed(4)),
    averageRange: Number(avgRange.toFixed(4)),
    patternReliability: {
      overall: overallPatternReliability,
      byPattern: patternReliabilityByPattern,
    },
    eventsCountByPattern,
    weights,
    // include raw metrics for transparency
    rawMetrics: {
      moves: events.map((e) => ({ id: e.id, movePercent: e.movePercent, direction: e.direction })),
      ranges: events.map((e) => ({ id: e.id, range: Number((e.high - e.low).toFixed(4)) })),
    },
  };

  return NextResponse.json(result);
}
