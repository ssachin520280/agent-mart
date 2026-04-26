export type AgentCategory = "Coding" | "Writing" | "Research" | "Data" | "Creative"

export type AgentListing = {
  slug: string
  name: string
  category: AgentCategory
  tagline: string
  description: string
  price: string
  rating: string
  jobs: string
  turnaround: string
  inputLabel: string
  executionType: "Built-in GPT" | "Seller webhook"
  accent: string
  promptExample: string
  deliverables: string[]
  apiSnippet: string
}

export const categories: AgentCategory[] = [
  "Coding",
  "Writing",
  "Research",
  "Data",
  "Creative",
]
