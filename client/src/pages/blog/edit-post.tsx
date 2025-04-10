import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, Category, Post } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditPostProps {
  postId: number;
}

export default function EditPost({ postId }: EditPostProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [formInitialized, setFormInitialized] = useState(false);

  // Fetch current user
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  const currentUser = users && users.length > 0 ? users[0] : null;

  // Fetch post data
  const { data: post, isLoading: postLoading, error: postError } = useQuery<Post>({
    queryKey: ['/api/posts', postId],
    queryFn: () => apiRequest(`/api/posts/${postId}`),
    enabled: !!postId,
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Form schema
  const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    slug: z.string().min(3, "Slug must be at least 3 characters").max(100, "Slug is too long")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    excerpt: z.string().max(200, "Excerpt must be less than 200 characters").optional().or(z.literal("")),
    featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    categoryId: z.string().transform(val => parseInt(val, 10)),
    status: z.enum(["draft", "published"]),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featuredImage: "",
      categoryId: "",
      status: "draft",
    },
  });

  // Initialize form with post data when loaded
  useEffect(() => {
    if (post && !formInitialized) {
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        featuredImage: post.featuredImage || "",
        categoryId: post.categoryId.toString(),
        status: post.status,
      });
      
      if (post.tags) {
        setTags(post.tags as string[]);
      }
      
      setFormInitialized(true);
    }
  }, [post, form, formInitialized]);

  // Update post mutation
  const updatePost = useMutation({
    mutationFn: async (data: FormValues & { tags: string[] }) => {
      return apiRequest(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      setLocation(`/post/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Check if there are actual changes
    if (post &&
      data.title === post.title &&
      data.slug === post.slug &&
      data.content === post.content &&
      data.excerpt === post.excerpt &&
      data.featuredImage === post.featuredImage &&
      parseInt(data.categoryId.toString()) === post.categoryId &&
      data.status === post.status &&
      JSON.stringify(tags) === JSON.stringify(post.tags)) {
      
      toast({
        title: "No changes",
        description: "No changes were made to the post.",
      });
      setLocation(`/post/${post.slug}`);
      return;
    }

    updatePost.mutate({
      ...data,
      tags,
    });
  };

  // Auto-generate slug from title (only if slug was not edited manually)
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Update slug when title changes if original slug matches auto-generated
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    if (post) {
      const currentSlug = form.getValues("slug");
      const originalGeneratedSlug = generateSlug(post.title);
      
      // Only auto-update slug if it hasn't been customized
      if (currentSlug === originalGeneratedSlug || currentSlug === post.slug) {
        form.setValue("slug", generateSlug(title));
      }
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim();
    if (
      newTag &&
      !tags.includes(newTag) &&
      tags.length < 5
    ) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // If post not found
  if (postError) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or may have been removed.</p>
        <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  // If user is not authenticated
  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You need to sign in</h2>
        <p className="text-gray-600 mb-6">Please sign in to edit a post.</p>
        <Button onClick={() => setLocation("/login")}>Sign In</Button>
      </div>
    );
  }

  // Check if the post belongs to the current user
  if (post && post.authorId !== currentUser.id) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h2>
        <p className="text-gray-600 mb-6">You don't have permission to edit this post.</p>
        <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  // Loading state
  if (postLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Post</CardTitle>
                  <CardDescription>Update your blog post.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title field */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your post title"
                            {...field}
                            onChange={handleTitleChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Slug field */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your-post-slug"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the title.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content field */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your post content here..."
                            className="min-h-[300px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Excerpt and featured image */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Excerpt field */}
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A short summary of your post"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          If left empty, the beginning of your post will be used.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Featured image field */}
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <div className="space-y-6">
                {/* Publish settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Draft posts are not visible to readers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setLocation("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updatePost.isPending}
                    >
                      {updatePost.isPending ? "Updating..." : "Update Post"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value.toString()}
                            disabled={categoriesLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>Add up to 5 tags to categorize your post</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          onBlur={addTag}
                          placeholder="Add a tag and press Enter"
                          className="rounded-r-none"
                          disabled={tags.length >= 5}
                        />
                        <Button 
                          type="button" 
                          onClick={addTag}
                          variant="secondary"
                          className="rounded-l-none"
                          disabled={tags.length >= 5}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tags.length}/5 tags
                      </div>
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button 
                              onClick={() => removeTag(tag)}
                              className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-gray-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}