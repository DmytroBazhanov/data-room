import { Input } from '@/components/ui/input.tsx';
import Search from '@/assets/svg/search.svg';

export function ApplicationSearch() {
  return (
    <div className="relative">
      <img
        alt="search icon"
        src={Search}
        className="absolute top-1/2 left-2.5 -translate-y-1/2 w-5"
      />
      <Input className="bg-blue-50 w-full max-w-[540px] h-10 pl-8" />
    </div>
  );
}
