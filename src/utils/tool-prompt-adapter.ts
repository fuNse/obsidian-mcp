import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Prompt, Tool } from "../types.js";

const GENERATED_PROMPT_PREFIX = "tool-";

type JsonSchema = {
  type?: string;
  properties?: Record<string, { description?: string; type?: string }>;
  required?: string[];
};

function getSchemaArguments(schema: JsonSchema): Prompt["arguments"] {
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);

  return Object.entries(properties).map(([name, propertySchema]) => ({
    name,
    description:
      propertySchema.description ??
      `Argument "${name}" for this tool.`,
    required: required.has(name)
  }));
}

function formatExampleArgs(promptArguments: Prompt["arguments"], args: unknown): string {
  if (args && typeof args === "object") {
    return JSON.stringify(args, null, 2);
  }

  const example: Record<string, string> = {};
  for (const arg of promptArguments) {
    example[arg.name] = arg.required ? "<required>" : "<optional>";
  }
  return JSON.stringify(example, null, 2);
}

function createPromptFromTool(tool: Tool): Prompt {
  const schema = (tool.inputSchema.jsonSchema ?? {}) as JsonSchema;
  const promptArguments = getSchemaArguments(schema);
  const promptName = `${GENERATED_PROMPT_PREFIX}${tool.name}`;

  return {
    name: promptName,
    description: `Guided prompt for the "${tool.name}" tool.`,
    arguments: promptArguments,
    handler: async (args) => {
      const renderedArgs = formatExampleArgs(promptArguments, args);
      const requiredArgs = promptArguments
        .filter(arg => arg.required)
        .map(arg => arg.name);

      const requiredArgsText = requiredArgs.length > 0
        ? requiredArgs.join(", ")
        : "None";

      const argumentHelp = promptArguments.length > 0
        ? promptArguments
          .map(arg => `- ${arg.name}${arg.required ? " (required)" : " (optional)"}: ${arg.description}`)
          .join("\n")
        : "- This tool does not require arguments.";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Use tool "${tool.name}" with valid arguments.\n\n` +
                `Tool description:\n${tool.description}\n\n` +
                `Required arguments: ${requiredArgsText}\n\n` +
                `Argument reference:\n${argumentHelp}\n\n` +
                `Arguments to use:\n${renderedArgs}`
            }
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text:
                `I will execute "${tool.name}" with validated arguments.\n` +
                `If a "vault" argument is required, I will first ensure it matches an available vault name.`
            }
          }
        ],
        _meta: {
          generatedFromTool: tool.name
        }
      };
    }
  };
}

export function createPromptsFromTools(tools: Tool[]): Prompt[] {
  const promptNames = new Set<string>();

  return tools.map(tool => {
    const prompt = createPromptFromTool(tool);
    if (promptNames.has(prompt.name)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Duplicate generated prompt name detected: ${prompt.name}`
      );
    }
    promptNames.add(prompt.name);
    return prompt;
  });
}

