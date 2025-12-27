import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/hooks/useActivityLog";
import {
  ArrowLeft,
  Users,
  Shield,
  ShieldOff,
  Search,
  RefreshCw,
  Loader2,
  Crown,
  User,
  MapPin,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserOverview {
  profile_id: string;
  user_id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  role: "admin" | "user";
  role_id: string | null;
  display_name: string | null;
  community_status: string | null;
  trust_score: number | null;
  country: string | null;
  city: string | null;
}

const UserRoleManagement = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const [users, setUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "grant" | "revoke";
    user: UserOverview | null;
  }>({ open: false, action: "grant", user: null });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch community profiles for additional info
      const { data: communityProfiles, error: cpError } = await supabase
        .from("community_profiles")
        .select("*");

      if (cpError) throw cpError;

      // Combine the data
      const combinedUsers: UserOverview[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        const communityProfile = communityProfiles?.find(
          (cp) => cp.user_id === profile.user_id
        );

        return {
          profile_id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          role: (userRole?.role as "admin" | "user") || "user",
          role_id: userRole?.id || null,
          display_name: communityProfile?.display_name || null,
          community_status: communityProfile?.status || null,
          trust_score: communityProfile?.trust_score || null,
          country: communityProfile?.country || null,
          city: communityProfile?.city || null,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAction = async () => {
    if (!confirmDialog.user) return;

    const { action, user } = confirmDialog;
    setActionLoading(user.user_id);

    try {
      if (action === "grant") {
        const { error } = await supabase.rpc("grant_admin_role", {
          target_user_id: user.user_id,
        });
        if (error) throw error;
        toast({
          title: "Admin role granted",
          description: `${user.email || user.user_id} is now an admin`,
        });
        
        // Log role grant
        logActivity({
          action_type: "role_granted",
          entity_type: "user",
          entity_id: user.user_id,
          details: {
            target_email: user.email,
            target_display_name: user.display_name,
            role: "admin",
          },
        });
      } else {
        const { error } = await supabase.rpc("revoke_admin_role", {
          target_user_id: user.user_id,
        });
        if (error) throw error;
        toast({
          title: "Admin role revoked",
          description: `${user.email || user.user_id} is now a regular user`,
        });
        
        // Log role revoke
        logActivity({
          action_type: "role_revoked",
          entity_type: "user",
          entity_id: user.user_id,
          details: {
            target_email: user.email,
            target_display_name: user.display_name,
            previous_role: "admin",
          },
        });
      }

      await fetchUsers();
    } catch (error: any) {
      console.error("Role action error:", error);
      toast({
        title: "Action failed",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "grant", user: null });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
  };

  if (authLoading || (!isAdmin && !authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="User & Role Management"
        description="Manage users and their roles"
        path="/admin/users"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="font-mono text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                    // Admin Tools
                  </div>
                  <h1 className="font-mono text-2xl md:text-3xl uppercase tracking-tight flex items-center gap-3">
                    <Users className="w-6 h-6 text-logo-green" />
                    User & Role Management
                  </h1>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={loading}
                className="font-mono text-xs"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border bg-card p-4 text-center">
                <div className="font-mono text-2xl text-foreground">
                  {stats.total}
                </div>
                <div className="font-mono text-xs text-muted-foreground uppercase">
                  Total Users
                </div>
              </div>
              <div className="border border-crimson/30 bg-crimson/5 p-4 text-center">
                <div className="font-mono text-2xl text-crimson">
                  {stats.admins}
                </div>
                <div className="font-mono text-xs text-crimson/70 uppercase">
                  Admins
                </div>
              </div>
              <div className="border border-logo-green/30 bg-logo-green/5 p-4 text-center">
                <div className="font-mono text-2xl text-logo-green">
                  {stats.users}
                </div>
                <div className="font-mono text-xs text-logo-green/70 uppercase">
                  Regular Users
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "admin", "user"] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={roleFilter === filter ? "brutalist" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter(filter)}
                    className="font-mono text-xs uppercase"
                  >
                    {filter === "all"
                      ? "All"
                      : filter === "admin"
                      ? "Admins"
                      : "Users"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="border border-border bg-card overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="font-mono text-xs text-muted-foreground mt-2">
                    Loading users...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="font-mono text-sm text-muted-foreground">
                    No users found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono text-xs uppercase">
                          User
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase">
                          Role
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase">
                          Community
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase">
                          Location
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase">
                          Joined
                        </TableHead>
                        <TableHead className="font-mono text-xs uppercase text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {user.role === "admin" ? (
                                  <Crown className="w-4 h-4 text-crimson" />
                                ) : (
                                  <User className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="font-mono text-sm">
                                  {user.display_name || "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="font-mono text-xs">
                                  {user.email || user.user_id.slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "destructive" : "outline"
                              }
                              className="font-mono text-xs uppercase"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.community_status ? (
                              <div className="space-y-1">
                                <Badge
                                  variant={
                                    user.community_status === "verified"
                                      ? "default"
                                      : user.community_status === "banned"
                                      ? "destructive"
                                      : "outline"
                                  }
                                  className="font-mono text-xs"
                                >
                                  {user.community_status}
                                </Badge>
                                {user.trust_score !== null && (
                                  <div className="font-mono text-xs text-muted-foreground">
                                    Trust: {user.trust_score}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.city || user.country ? (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="font-mono text-xs">
                                  {[user.city, user.country]
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              </div>
                            ) : (
                              <span className="font-mono text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span className="font-mono text-xs">
                                {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {user.role === "admin" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    action: "revoke",
                                    user,
                                  })
                                }
                                disabled={actionLoading === user.user_id}
                                className="font-mono text-xs text-crimson hover:text-crimson hover:bg-crimson/10"
                              >
                                {actionLoading === user.user_id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <ShieldOff className="w-4 h-4 mr-1" />
                                    Revoke
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    action: "grant",
                                    user,
                                  })
                                }
                                disabled={actionLoading === user.user_id}
                                className="font-mono text-xs text-logo-green hover:text-logo-green hover:bg-logo-green/10"
                              >
                                {actionLoading === user.user_id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4 mr-1" />
                                    Make Admin
                                  </>
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Info box */}
            <div className="border border-muted bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="font-mono text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Note:</strong> You cannot revoke your own admin
                    role.
                  </p>
                  <p>
                    Admin roles grant full access to all admin tools and data
                    management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono uppercase">
              {confirmDialog.action === "grant"
                ? "Grant Admin Role"
                : "Revoke Admin Role"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              {confirmDialog.action === "grant" ? (
                <>
                  Are you sure you want to make{" "}
                  <strong>
                    {confirmDialog.user?.email ||
                      confirmDialog.user?.user_id.slice(0, 8)}
                  </strong>{" "}
                  an admin? They will have full access to all admin tools.
                </>
              ) : (
                <>
                  Are you sure you want to revoke admin access from{" "}
                  <strong>
                    {confirmDialog.user?.email ||
                      confirmDialog.user?.user_id.slice(0, 8)}
                  </strong>
                  ? They will become a regular user.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleAction}
              className={`font-mono text-xs ${
                confirmDialog.action === "revoke"
                  ? "bg-crimson hover:bg-crimson/90"
                  : "bg-logo-green hover:bg-logo-green/90"
              }`}
            >
              {confirmDialog.action === "grant" ? "Grant Admin" : "Revoke Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserRoleManagement;
