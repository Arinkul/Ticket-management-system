import { createEventAction } from "@/server/actions/event.actions";
import { EventForm } from "@/components/admin/EventForm";
import { Card } from "@/components/ui/Card";

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create event</h1>
      <Card className="p-6">
        <EventForm action={createEventAction} submitLabel="Create event" />
      </Card>
    </main>
  );
}
