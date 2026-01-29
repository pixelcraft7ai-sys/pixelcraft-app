import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, X, Shield, Edit2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CollaboratorsListProps {
  projectId: number;
  isOwner: boolean;
}

export function CollaboratorsList({ projectId, isOwner }: CollaboratorsListProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"editor" | "viewer">("editor");

  // Fetch collaborators
  const collaboratorsQuery = trpc.collaboration.getCollaborators.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Fetch active sessions
  const sessionsQuery = trpc.collaboration.getActiveSessions.useQuery(
    { projectId },
    { enabled: !!projectId, refetchInterval: 5000 }
  );

  // Invite collaborator mutation
  const inviteMutation = trpc.collaboration.inviteCollaborator.useMutation();

  // Remove collaborator mutation
  const removeMutation = trpc.collaboration.removeCollaborator.useMutation();

  const collaborators = collaboratorsQuery.data || [];
  const activeSessions = sessionsQuery.data || [];

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      // In a real app, you'd look up the user by email first
      // For now, we'll show a placeholder message
      toast.info("Invite feature coming soon - email lookup needed");
      setInviteEmail("");
      setShowInviteForm(false);
    } catch (error: any) {
      toast.error("Failed to send invite: " + error.message);
    }
  };

  const handleRemove = async (userId: number) => {
    try {
      await removeMutation.mutateAsync({ projectId, userId });
      toast.success("Collaborator removed");
      collaboratorsQuery.refetch();
    } catch (error: any) {
      toast.error("Failed to remove collaborator");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="w-4 h-4 text-purple-600" />;
      case "editor":
        return <Edit2 className="w-4 h-4 text-blue-600" />;
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isUserActive = (userId: number) => {
    return activeSessions.some((session) => session.userId === userId);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Collaborators ({collaborators.length})
        </h3>
        {isOwner && (
          <Button
            size="sm"
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Invite
          </Button>
        )}
      </div>

      {/* Invite Form */}
      {showInviteForm && isOwner && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
          <Input
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className="flex-1"
            >
              Send Invite
            </Button>
          </div>
        </div>
      )}

      {/* Collaborators List */}
      <div className="space-y-2">
        {collaborators.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No collaborators yet
          </p>
        ) : (
          collaborators.map((collab: any) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {isUserActive(collab.userId) ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    User #{collab.userId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {collab.status === "pending" ? "Pending" : "Active"}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getRoleIcon(collab.role)}
                  <span className="text-xs text-gray-600">
                    {getRoleLabel(collab.role)}
                  </span>
                </div>
              </div>
              {isOwner && collab.role !== "owner" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(collab.userId)}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Active Sessions Info */}
      {activeSessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Active Now: {activeSessions.length}
          </p>
          <div className="flex flex-wrap gap-1">
            {activeSessions.map((session: any) => (
              <span
                key={session.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
              >
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                User #{session.userId}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
