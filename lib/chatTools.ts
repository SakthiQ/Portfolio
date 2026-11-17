import type { FunctionDeclaration } from "@google/genai";
import { sections } from "./site";

// Declarations for the page actions the model may request. They run in the
// visitor's browser (see components/chat/ChatProvider.tsx), not on the server.
export function buildToolDeclarations(slugs: string[], tags: string[]): FunctionDeclaration[] {
  return [
    {
      name: "open_project",
      description: "Open the detail page of one project.",
      parametersJsonSchema: {
        type: "object",
        properties: { slug: { type: "string", enum: slugs, description: "Project slug" } },
        required: ["slug"],
      },
    },
    {
      name: "filter_projects",
      description: "Scroll to the projects grid and filter it to one tag.",
      parametersJsonSchema: {
        type: "object",
        properties: { tag: { type: "string", enum: tags } },
        required: ["tag"],
      },
    },
    {
      name: "scroll_to_section",
      description: "Scroll the home page to a section.",
      parametersJsonSchema: {
        type: "object",
        properties: { section: { type: "string", enum: sections.map((s) => s.id) } },
        required: ["section"],
      },
    },
    {
      name: "show_contact",
      description: "Show the visitor how to contact Sakthi.",
      parametersJsonSchema: { type: "object", properties: {} },
    },
  ];
}

export const TOOL_NAMES = ["open_project", "filter_projects", "scroll_to_section", "show_contact"] as const;
