import { Outlet, Link } from "react-router";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/toaster";

const RootLayout = () => {
  return (
    <>
      <header className="bg-secondary-foreground text-primary-background">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <Button variant="outline" className="p-4" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="outline" className="p-4" asChild>
            <Link to="/entities" className="ml-auto">
              Entities
            </Link>
          </Button>
        </nav>
      </header>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <Toaster />
    </>
  );
};

export default RootLayout;
