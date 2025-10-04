interface ProgressBarProps {
  total: number;
  completed: number;
  status: boolean;
}

const ProgressBar = ({ total, completed, status }: ProgressBarProps) => {
  // ゼロ除算を避けるための計算
  const progressPercentage = total > 0 
    ? (completed / total) * 100 
    : status ? 100 : 0;

  return (
    <div className="mb-2">
      <div className="flex justify-between w-60 sm:w-51 mb-1 items-center">
        <div className="w-51 sm:w-42 mt-1 h-2.5 relative overflow-hidden bg-gradient-to-r from-cyan-100 to-cyan-700">
            <div 
            className="bg-gray-200 h-full w-full absolute top-0 left-0 transition-transform duration-500 ease-in-out" 
            style={{ transform: `translateX(${progressPercentage}%)` }}
            >
            </div>
        </div>
        <div className="text-xs font-medium text-gray-500">
          {total > 0 ? `${completed} / ${total}` : ""}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;