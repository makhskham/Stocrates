import { NextResponse } from "next/server";
import { getPolygonCandles } from "@/lib/analyze-event/polygon";
import { polygonToEvents, EventItem } from "@/lib/analyze-event/market-event";

/* ---------------- helpers ---------------- */

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/* ---------------- route ---------------- */

export async function GET() {
  // Fetch real stock data (Apple)
  const aggs = await getPolygonCandles("AAPL", 5, "minute");

  // Convert candles -> detected trading events
  const events: EventItem[] = polygonToEvents(aggs);

  const count = events.length;

  /* ---------- averages ---------- */

  const avgMove = mean(events.map(e => e.movePercent));
  const ranges = events.map(e => e.high - e.low);
  const avgRange = mean(ranges);

  /* ---------- pattern reliability ---------- */

  let totalMatches = 0;

  const patternStats: Record<string, { count: number; matches: number }> = {};

  for (const e of events) {
    const p = e.pattern || "unknown";

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
      reliability:
        s.count > 0
          ? Number(((s.matches / s.count) * 100).toFixed(2))
          : 0,
    };
  }

  const overallPatternReliability =
    count > 0 ? Number(((totalMatches / count) * 100).toFixed(2)) : 0;

  /* ---------- counts ---------- */

  const eventsCountByPattern: Record<string, number> = {};
  for (const e of events) {
    eventsCountByPattern[e.pattern] =
      (eventsCountByPattern[e.pattern] || 0) + 1;
  }

  /* ---------- weights ---------- */

  const weights = {
    avgMove: 0.4,
    avgRange: 0.3,
    patternReliability: 0.3,
    explanation:
      "Weights indicate relative importance when combining metrics into a composite score. Adjust as needed.",
  } as const;

  /* ---------- raw metrics ---------- */

  const rawMetrics = {
    moves: events.map(e => ({
      id: e.id,
      movePercent: e.movePercent,
      direction: e.direction,
    })),
    ranges: events.map(e => ({
      id: e.id,
      range: Number((e.high - e.low).toFixed(4)),
    })),
  };

  /* ---------- final JSON ---------- */

  return NextResponse.json({
    count,
    averageMovePercent: Number(avgMove.toFixed(4)),
    averageRange: Number(avgRange.toFixed(4)),
    patternReliability: {
      overall: overallPatternReliability,
      byPattern: patternReliabilityByPattern,
    },
    eventsCountByPattern,
    weights,
    rawMetrics,
  });
}
