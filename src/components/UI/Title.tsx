type TitleProps = {
  text1: string;
  text2: string;
  badge?: string;
};

const Title = ({ text1, text2, badge }: TitleProps) => {
  return (
    <div className="flex items-center justify-between w-full mb-4 mt-4">
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
          <span className="text-gray-900 dark:text-white">{text1}</span>
          <span className="text-primary ml-2">{text2}</span>
        </h1>
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold ml-2">
            {badge}
          </span>
        )}
      </div>
      {/* You can add more actions or info here if needed */}
    </div>
  );
};

export default Title;
