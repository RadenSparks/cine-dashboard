type TitleProps = {
  text1: string;
  text2: string;
  badge?: string;
  description?: string;
};

const Title = ({ text1, text2, badge, description }: TitleProps) => {
  return (
    <div className="mb-4 mt-4 flex w-full items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="min-w-0 break-words font-audiowide text-2xl font-bold tracking-tight text-slate-950 md:text-3xl dark:text-white" style={{ fontFamily: "Audiowide, sans-serif" }}>
            <span>{text1}</span>
            {text2 ? <span className="ml-2">{text2}</span> : null}
          </h1>
          {badge ? (
            <span className="inline-flex max-w-full items-center break-words rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 font-red-rose dark:border-sky-700/60 dark:bg-sky-500/12 dark:text-sky-100" style={{ fontFamily: "Red Rose, sans-serif" }}>
              {badge}
            </span>
          ) : null}
        </div>
        {description ? <p className="body-copy mt-2 max-w-3xl">{description}</p> : null}
      </div>
    </div>
  );
};

export default Title;
