import {
  GalleryVerticalEnd,
  Home,
  Settings2,
  SquareTerminal,
  BookOpen,
  Info,
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@ikim-ui/ui-components/primitive/sidebar';
import { NavProject } from '@/containers/project/components/NavProject';
import { NavUser } from '@/containers/user/components/NavUser';
import { TeamSwitcher } from '@/containers/team/components/SwitchTeam';
import { useProjectStore } from '@/containers/project';
import { useAuth } from '@/contexts/AuthContext';

// This is sample data.
const data = {
  user: {
    name: 'test',
    email: 'test@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'IKIM',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
  ],
};

export default function SideBar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { projects, deleteProject } = useProjectStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Convert projects to NavProject format
  const projectItems = projects.map((project) => ({
    name: project.name,
    url: `/projects/${project.id}`,
    icon: SquareTerminal, // You can customize this per project if needed
    id: project.id,
  }));

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      // Optionally navigate to projects list or refresh
      navigate({ to: '/projects' });
    } catch (error) {
      // Failed to delete project, continue silently
    }
  };

  // Use real user data or fallback to sample data
  const userData = user
    ? {
        name: user.username || user.email,
        email: user.email,
        avatar: '/avatars/shadcn.jpg', // You can add avatar to user model later
      }
    : data.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2">
          <SidebarMenuButton asChild>
            <Link to="/projects">
              <Home />
              <span>Home</span>
            </Link>
          </SidebarMenuButton>
        </div>
        <div className="px-2">
          <SidebarMenuButton asChild>
            <Link to="/settings">
              <Settings2 />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </div>
        <div className="px-2">
          <SidebarMenuButton asChild>
            <Link to="/docs">
              <BookOpen />
              <span>Documentation</span>
            </Link>
          </SidebarMenuButton>
        </div>
        <div className="px-2">
          <SidebarMenuButton asChild>
            <Link to="/about">
              <Info />
              <span>About</span>
            </Link>
          </SidebarMenuButton>
        </div>
        <NavProject
          projects={projectItems}
          onDeleteProject={handleDeleteProject}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
