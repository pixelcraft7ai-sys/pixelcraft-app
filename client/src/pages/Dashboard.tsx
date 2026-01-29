import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, LogOut, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Fetch user's projects
  const projectsQuery = trpc.projects.list.useQuery({});
  const subscriptionQuery = trpc.subscription.current.useQuery();
  const createProjectMutation = trpc.projects.save.useMutation();

  const projects = projectsQuery.data || [];
  const subscription = subscriptionQuery.data;

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      const result = await createProjectMutation.mutateAsync({
        title: "New Project",
        description: "Describe your project here...",
        generatedHtml: "",
        generatedCss: "",
        generatedJs: "",
      });
      toast.success("Project created successfully");
      projectsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/editor">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Card */}
        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {subscription?.subscription_plans?.name || "Free"} Plan
                </h2>
                <p className="text-gray-600 mb-4">
                  {subscription?.user_subscriptions?.status === "active"
                    ? "Your subscription is active"
                    : "You're on the free plan"}
                </p>
                {subscription?.user_subscriptions?.currentPeriodEnd && (
                  <p className="text-sm text-gray-500">
                    Renews on{" "}
                    {new Date(subscription.user_subscriptions.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link href="/pricing">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Upgrade Plan
                  </Button>
                </Link>
                <Button variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <Button
              onClick={handleCreateProject}
              disabled={isCreatingProject}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreatingProject ? "Creating..." : "New Project"}
            </Button>
          </div>

          {projectsQuery.isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <p className="text-gray-400 mb-6">
                Create your first project to get started
              </p>
              <Link href="/editor">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="p-6 hover:shadow-lg transition cursor-pointer"
                >
                  <Link href={`/editor?projectId=${project.id}`}>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {project.description || "No description"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
