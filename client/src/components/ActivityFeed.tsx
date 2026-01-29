import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, Edit2, Zap, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  projectId: number;
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([]);

  // Fetch activity logs
  const activityQuery = trpc.collaboration.getActivityLogs.useQuery(
    { projectId, limit: 20 },
    { enabled: !!projectId, refetchInterval: 3000 }
  );

  useEffect(() => {
    if (activityQuery.data) {
      setActivities(activityQuery.data);
    }
  }, [activityQuery.data]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "edit_description":
        return <Edit2 className="w-4 h-4 text-blue-600" />;
      case "generate_code":
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case "update_title":
        return <Save className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      edit_description: "Edited description",
      generate_code: "Generated code",
      update_title: "Updated title",
    };
    return labels[action] || action;
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5" />
        Activity Feed
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No activity yet
          </p>
        ) : (
          activities.map((activity: any) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition"
            >
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {getActionLabel(activity.action)}
                </p>
                <p className="text-xs text-gray-500">
                  User #{activity.userId}
                </p>
                {activity.fieldChanged && (
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-mono bg-gray-100 px-1 rounded">
                      {activity.fieldChanged}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
