export const revalidate = false;

const markdown = `# Copy Markdown Fixture

This fixture proves the built copy flow can read and write markdown content.
`;

export function GET() {
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}
