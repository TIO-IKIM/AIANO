import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Link } from '@tanstack/react-router';

function ErrorComponent() {
  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center">
      <h1 className="text-4xl font-bold">Error</h1>
      <Button>
        <Link to="/">Go back to homepage</Link>
      </Button>
    </div>
  );
}

export default ErrorComponent;
