interface PageLayoutProps {
  children: React.ReactNode;
  testId?: string;
}

function PageLayout({ children, testId }: PageLayoutProps) {
  return (
    <div data-testid={testId} className="flex flex-col min-h-screen sm:h-screen">
      {children}
    </div>
  );
}

export { PageLayout, type PageLayoutProps };
