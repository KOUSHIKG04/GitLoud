import { Button } from "@/components/ui/button";

export function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-muted-foreground">{label}</p>
      <p className="break-all font-medium">{value}</p>
    </div>
  );
}

export function ContentBlock({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: string;
  onCopy: (value: string) => void | Promise<void>;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold sm:text-base">{title}</h4>

        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {value}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCopy(value)}
        className="w-full sm:w-fit"
      >
        Copy
      </Button>
    </section>
  );
}

export function ContentListBlock({
  title,
  values,
  onCopy,
}: {
  title: string;
  values: string[];
  onCopy: (value: string) => void | Promise<void>;
}) {
  const text = values.map((value) => `- ${value}`).join("\n");

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold sm:text-base">{title}</h4>

        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          {values.map((value) => (
            <li key={value} className="break-words">
              {value}
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCopy(text)}
        className="w-full sm:w-fit"
      >
        Copy
      </Button>
    </section>
  );
}
