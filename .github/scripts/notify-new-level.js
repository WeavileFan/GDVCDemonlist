// Posts a Discord embed for every level file newly ADDED to data/ in a push.
// Needs Node 18+ (built-in fetch). No dependencies.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const PING = process.env.PING || ""; // e.g. "<@&123456789012345678>" or "@everyone"
const BEFORE = process.env.BEFORE_SHA;
const AFTER = process.env.AFTER_SHA || "HEAD";
const SITE = "https://weavilefan.github.io/GDVCDemonlist/#/";
const DRY_RUN = process.env.DRY_RUN === "1";

if (!WEBHOOK && !DRY_RUN) {
  console.error("DISCORD_WEBHOOK_URL is not set");
  process.exit(1);
}

// Level files are hand-edited, so tolerate trailing commas (the README example has one).
function parseLoose(text) {
  return JSON.parse(text.replace(/^\uFEFF/, "").replace(/,(\s*[}\]])/g, "$1"));
}

function newLevelFiles() {
  const base = !BEFORE || /^0+$/.test(BEFORE) ? `${AFTER}~1` : BEFORE;
  const out = execSync(
    `git diff --diff-filter=A --name-only ${base} ${AFTER} -- "data/*.json"`,
    { encoding: "utf8" }
  );
  return out
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f && !path.basename(f).startsWith("_"));
}

// Rank = position in data/_list.json (ordered array of file names), if it exists.
function getRank(file) {
  try {
    const list = parseLoose(fs.readFileSync("data/_list.json", "utf8"));
    const key = path.basename(file, ".json");
    const i = list.findIndex((n) => String(n).replace(/\.json$/, "") === key);
    return i >= 0 ? { rank: i + 1, total: list.length } : null;
  } catch {
    return null;
  }
}

function youtubeId(url = "") {
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function buildEmbed(file, lvl) {
  const rank = getRank(file);
  const creators = Array.isArray(lvl.creators) ? lvl.creators.join(", ") : lvl.creators;
  const yt = youtubeId(lvl.verification);
  const fields = [
    { name: "Level ID", value: `\`${lvl.id}\``, inline: true },
    { name: "Publisher", value: String(lvl.author ?? "Unknown"), inline: true },
    { name: "Creators", value: String(creators ?? "Unknown"), inline: true },
    { name: "Verifier", value: String(lvl.verifier ?? "Unknown"), inline: true },
    { name: "Click Method", value: String(lvl.clickMethod ?? "Unknown"), inline: true },
    { name: "Enjoyment", value: String(lvl.enjoyment ?? "N/A"), inline: true },
    { name: "Min. % to Qualify", value: `${lvl.percentToQualify ?? 100}%`, inline: true },
  ];
  if (lvl.password) fields.push({ name: "Copy Password", value: String(lvl.password), inline: true });
  if (lvl.verification) fields.push({ name: "Verification", value: `[Watch video](${lvl.verification})`, inline: true });

  const embed = {
    title: `🆕 ${lvl.name}`,
    url: SITE,
    description: rank
      ? `A new level has been placed at **#${rank.rank}** on the GDVC Demonlist!`
      : "A new level has been added to the GDVC Demonlist!",
    color: 0xe74c3c,
    fields,
    footer: { text: "GDVC Demonlist" },
    timestamp: new Date().toISOString(),
  };
  if (yt) embed.image = { url: `https://img.youtube.com/vi/${yt}/maxresdefault.jpg` };
  return embed;
}

async function main() {
  const files = newLevelFiles();
  if (!files.length) return console.log("No new level files in this push.");

  for (const file of files) {
    let lvl;
    try {
      lvl = parseLoose(fs.readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`Could not parse ${file}: ${e.message}`);
      continue;
    }
    const payload = {
      content: PING ? `${PING} New level placed!` : undefined,
      allowed_mentions: { parse: ["roles", "everyone"] },
      embeds: [buildEmbed(file, lvl)],
    };
    if (DRY_RUN) {
      console.log(JSON.stringify(payload, null, 2));
      continue;
    }
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(`${file}: Discord responded ${res.status}`);
    if (!res.ok) console.error(await res.text());
    await new Promise((r) => setTimeout(r, 1000)); // be gentle with rate limits
  }
}

main();
