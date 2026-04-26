import { config } from "dotenv"
import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "../app/generated/prisma/client"

config({ path: ".env.local", override: true })
config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed AgentMart.")
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
})

const seedAgents = [
  {
    slug: "code-reviewer",
    name: "Code Reviewer Agent",
    category: "Coding",
    tagline: "Pull-request level critique in under a minute.",
    description:
      "Paste a function, diff, or repo excerpt and receive a structured review with bugs, risk areas, refactor suggestions, and test gaps.",
    price: "0.25",
    rating: "4.9",
    jobs: "1.8k",
    turnaround: "45 sec",
    inputLabel: "Paste your code or diff",
    executionType: "Built-in GPT",
    accent: "from-lime-300 via-emerald-300 to-cyan-300",
    promptExample: "Review this TypeScript checkout route for race conditions and missing validation.",
    deliverables: ["Severity-ranked findings", "Suggested patch notes", "Focused test plan"],
    apiSnippet: "POST /api/hire/code-reviewer",
  },
  {
    slug: "research-scout",
    name: "Research Scout",
    category: "Research",
    tagline: "Turns messy questions into cited briefs.",
    description:
      "Give it a topic and it returns a concise research packet with assumptions, useful sources, counterpoints, and next-step questions.",
    price: "0.40",
    rating: "4.8",
    jobs: "940",
    turnaround: "2 min",
    inputLabel: "Describe the research target",
    executionType: "Built-in GPT",
    accent: "from-amber-200 via-orange-300 to-rose-300",
    promptExample: "Summarize the market for AI payment agents and highlight hackathon demo angles.",
    deliverables: ["Executive brief", "Source map", "Open questions"],
    apiSnippet: "POST /api/hire/research-scout",
  },
  {
    slug: "data-cleaner",
    name: "Data Cleaner",
    category: "Data",
    tagline: "Normalizes CSV chaos before it reaches your database.",
    description:
      "Submit pasted rows or a URL and get a cleaning report, inferred schema, dedupe plan, and transformed sample output.",
    price: "0.35",
    rating: "4.7",
    jobs: "720",
    turnaround: "90 sec",
    inputLabel: "Paste rows or a file URL",
    executionType: "Seller webhook",
    accent: "from-sky-300 via-blue-300 to-indigo-300",
    promptExample: "Clean these customer rows, standardize dates, and identify likely duplicates.",
    deliverables: ["Schema inference", "Cleaning log", "Normalized sample"],
    apiSnippet: "POST /api/hire/data-cleaner",
  },
  {
    slug: "copy-finisher",
    name: "Copy Finisher",
    category: "Writing",
    tagline: "Ships sharper product copy without brand drift.",
    description:
      "Drop rough copy and choose a tone. It returns a polished version, punchier alternates, and why each edit improves conversion.",
    price: "0.18",
    rating: "4.9",
    jobs: "2.1k",
    turnaround: "30 sec",
    inputLabel: "Paste draft copy",
    executionType: "Built-in GPT",
    accent: "from-fuchsia-300 via-pink-300 to-red-300",
    promptExample: "Rewrite this landing hero for technical founders buying agent services.",
    deliverables: ["Final copy", "A/B headline set", "Rationale notes"],
    apiSnippet: "POST /api/hire/copy-finisher",
  },
  {
    slug: "brand-spark",
    name: "Brand Spark",
    category: "Creative",
    tagline: "Names, taglines, and visual directions for fast launches.",
    description:
      "Give it a concept and audience. It returns naming routes, positioning language, palette ideas, and launch-ready creative prompts.",
    price: "0.50",
    rating: "4.6",
    jobs: "510",
    turnaround: "3 min",
    inputLabel: "Describe the product or campaign",
    executionType: "Built-in GPT",
    accent: "from-violet-300 via-purple-300 to-cyan-300",
    promptExample: "Create a launch identity for an AI-to-AI service marketplace.",
    deliverables: ["Naming routes", "Tagline bank", "Visual direction"],
    apiSnippet: "POST /api/hire/brand-spark",
  },
  {
    slug: "api-contract-tester",
    name: "API Contract Tester",
    category: "Coding",
    tagline: "Finds broken assumptions in JSON endpoints.",
    description:
      "Send an endpoint shape or OpenAPI excerpt and receive edge cases, validation rules, and contract tests ready to port into your stack.",
    price: "0.30",
    rating: "4.8",
    jobs: "860",
    turnaround: "60 sec",
    inputLabel: "Paste endpoint docs or response JSON",
    executionType: "Seller webhook",
    accent: "from-teal-200 via-lime-200 to-yellow-200",
    promptExample: "Generate contract tests for the AI agent hiring endpoint.",
    deliverables: ["Edge-case matrix", "Validation checklist", "Test skeleton"],
    apiSnippet: "POST /api/hire/api-contract-tester",
  },
]

async function main() {
  for (const agent of seedAgents) {
    await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: agent,
      create: agent,
    })
  }

  console.log(`Seeded ${seedAgents.length} agent listings.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
