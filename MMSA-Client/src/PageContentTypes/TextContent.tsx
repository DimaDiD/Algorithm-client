const TextContent = ({ text }: { text: string }) => (
  <div className="prose" dangerouslySetInnerHTML={{ __html: text }} />
);

export default TextContent;
