import { ApplicationLayout } from './application-layout';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationLayout>
      {children}
    </ApplicationLayout>
  );
} 