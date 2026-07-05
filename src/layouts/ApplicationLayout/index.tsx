import { Outlet } from 'react-router-dom';
import { ApplicationSidebar } from '@/components/custom/Sidebar.tsx';
import { ApplicationSearch } from '@/components/custom/Search.tsx';

export function ApplicationLayout() {
  return (
    <div className="flex h-screen flex-row overflow-hidden">
      <ApplicationSidebar />

      <div className="flex flex-col h-full grow-1 w-full">
        <ApplicationSearch />
        <main className="mx-auto max-h-[calc(100vh-72px)] w-full flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
