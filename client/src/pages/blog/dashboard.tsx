import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { User, Post, Category } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch current user
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  const currentUser = users && users.length > 0 ? users[0] : null;

  // Fetch user's posts
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['/api/posts/author', currentUser?.id],
    queryFn: () => apiRequest(`/api/posts/author/${currentUser?.id}`),
    enabled: !!currentUser?.id,
  });

  // Fetch categories for reference
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/author', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle post deletion with confirmation
  const handleDeletePost = (postId: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deletePost.mutate(postId);
    }
  };

  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "—";
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Get category name
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || "Uncategorized";
  };

  // If user is not authenticated
  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You need to sign in</h2>
        <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
        <Button onClick={() => setLocation("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
        <Link href="/create">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Your Posts</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts">
          {postsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : postsError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-red-600 mb-2">Error loading posts</p>
                <p className="text-gray-600">Please try again later</p>
              </CardContent>
            </Card>
          ) : !posts || posts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">You haven't created any posts yet</h3>
                <p className="text-gray-600 mb-6">Start writing and share your thoughts with the world.</p>
                <Link href="/create">
                  <Button>Create Your First Post</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <Link href={`/post/${post.slug}`}>
                            <a className="hover:text-indigo-600">{post.title}</a>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.status === "published" ? "default" : "outline"}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{getCategoryName(post.categoryId)}</TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell>{formatDate(post.publishedAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/post/${post.slug}`)}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLocation(`/edit/${post.id}`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeletePost(post.id, post.title)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Posts</CardTitle>
                <CardDescription>Total posts you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{posts?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Published</CardTitle>
                <CardDescription>Posts that are live</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{posts?.filter(p => p.status === "published").length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Drafts</CardTitle>
                <CardDescription>Posts in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{posts?.filter(p => p.status === "draft").length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1">{currentUser.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Username</h3>
                  <p className="mt-1">{currentUser.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{currentUser.email}</p>
                </div>
                {currentUser.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                    <p className="mt-1">{currentUser.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}