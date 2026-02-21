import dynamic from 'next/dynamic';

const CreateReminderForm = dynamic(() => import('@/components/create-reminder-form'), {
  loading: () => <div className="h-64 rounded-xl skeleton bg-slate-200 dark:bg-slate-800" />
});
const ReminderList = dynamic(() => import('@/components/reminder-list'), {
  loading: () => <div className="h-96 rounded-xl skeleton bg-slate-200 dark:bg-slate-800" />
});

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900 dark:text-white">
            Call Me Reminder
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Never miss a beat. We call you when it matters.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[350px_1fr]">
          <div className="md:sticky md:top-10 h-fit">
            <CreateReminderForm />
          </div>
          <div>
            <ReminderList />
          </div>
        </div>
      </div>
    </main>
  );
}
