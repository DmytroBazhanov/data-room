import { Outlet } from 'react-router-dom';
import { ApplicationSidebar } from '@/components/custom/Sidebar.tsx';
import { ApplicationSearch } from '@/components/custom/Search.tsx';
import { FolderCrumbs } from '@/components/custom/FolderCrumbs.tsx';

export function ApplicationLayout() {
  return (
    <div className="flex h-screen flex-row overflow-hidden">
      <ApplicationSidebar />

      <div className="flex flex-col h-full grow-1 w-full px-2">
        <ApplicationSearch />
        <div className="pt-2">
          <FolderCrumbs />
        </div>
        <main className="mx-auto max-h-[calc(100vh-72px)] w-full flex-1 overflow-y-auto py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
