export function Notice({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
