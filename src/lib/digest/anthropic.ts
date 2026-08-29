import Anthropic from "@anthropic-ai/sdk";

/** Thrown when ANTHROPIC_API_KEY isn't set yet — callers should skip topic-brief
 * generation for the day rather than crash the whole digest run. */
export class AnthropicNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not configured.");
    this.name = "AnthropicNotConfiguredError";
  }
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AnthropicNotConfiguredError();
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

/** Number of web searches Claude is allowed to run per topic per day — the
 * real cost lever here (billed per search on top of tokens), capped so one
 * topic can never run away with spend. */
const MAX_SEARCHES_PER_TOPIC = 3;

/**
 * Asks Claude, with live web search, for today's brief on one topic. Returns
 * plain text — short bullet-style lines, ~10 items — suitable for dropping
 * straight into a PDF section. Throws on any failure; callers should catch
 * per-topic so one bad topic never blocks the others.
 */
export async function generateTopicBrief(topicTitle: string): Promise<string> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: MAX_SEARCHES_PER_TOPIC }],
    messages: [
      {
        role: "user",
        content: `Search the web for what's happened TODAY related to "${topicTitle}". Write a short brief: around 10 short bullet lines, each one sentence, covering the most notable things that happened today on this topic. Plain text only, one bullet per line starting with "- ", no headings, no preamble, no citations or links in the text — just the bullets. If there isn't much news today, give fewer, real bullets rather than padding with filler.`,
      },
    ],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) throw new Error(`Empty brief returned for topic "${topicTitle}"`);
  return text;
}
