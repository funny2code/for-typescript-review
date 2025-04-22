interface PageHeadingProps {
  title: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({ title }) => {
  return (
    <h3 className="font-wk font-bold text-xl text-gray-900">
      {title}
    </h3>
  );
};
