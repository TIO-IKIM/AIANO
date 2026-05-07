import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Link } from '@tanstack/react-router';

const NotFoundComponent: React.FC = () => (
  <div className="flex flex-col gap-4 h-screen w-screen justify-center items-center">
    <h1 className="text-4xl font-bold">404</h1>
    <Button>
      <Link to="/">Go back to homepage</Link>
    </Button>
  </div>
);

export default NotFoundComponent;
