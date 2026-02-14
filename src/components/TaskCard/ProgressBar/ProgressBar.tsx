import { TaskStatus } from "@/types";

interface ProgressBarProps {
  total: number;
  completed: number;
  status: TaskStatus;
}

const ProgressBar = ({ total, completed, status }: ProgressBarProps) => {
  // ゼロ除算を避けるための計算
  const progressPercentage = total > 0
    ? (completed / total) * 100
    : status === '完了' ? 100 : 0;

  return (
    <div className="mb-2">
      <div className="flex justify-between w-60 sm:w-51 mb-1 items-center">
        <div className="w-51 sm:w-42 mt-1 h-2.5 relative overflow-hidden rounded-full" style={{ background: `linear-gradient(to right, rgb(var(--theme-1)), rgb(var(--theme-4)))` }}>
          <div
            className="h-full w-full absolute top-0 left-0 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${progressPercentage}%)`, background: 'var(--color-surface)' }}
          >
          </div>
        </div>
        <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {total > 0 ? `${completed} / ${total}` : ""}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;