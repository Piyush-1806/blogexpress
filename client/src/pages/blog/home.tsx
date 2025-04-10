import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Post, Category, User } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch published posts
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['/api/posts/status/published'],
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch all users (for author information)
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Filter posts by selected category
  const filteredPosts = selectedCategoryId 
    ? posts?.filter(post => post.categoryId === selectedCategoryId)
    : posts;

  // Find category name by ID
  const getCategoryName = (categoryId: number) => {
    return categories?.find(cat => cat.id === categoryId)?.name || "Uncategorized";
  };

  // Find author name by ID
  const getAuthorName = (authorId: number) => {
    return users?.find(user => user.id === authorId)?.name || "Unknown Author";
  };

  // Format date as human-readable
  const formatDate = (date: Date | null) => {
    return date ? format(new Date(date), 'MMMM dd, yyyy') : '';
  };

  // Handle category selection
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId);
  };

  if (postsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading posts</h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main content area */}
      <div className="lg:col-span-3">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {selectedCategoryId ? `Posts in ${getCategoryName(selectedCategoryId)}` : "Latest Posts"}
          </h2>
          
          {/* Mobile category selection */}
          <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
            {categoriesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            ) : (
              categories?.map(category => (
                <Badge 
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Badge>
              ))
            )}
            {selectedCategoryId && (
              <Badge 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedCategoryId(null)}
              >
                Clear filter
              </Badge>
            )}
          </div>
          
          {/* Posts */}
          {postsLoading ? (
            // Skeleton loading
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-40" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredPosts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedCategoryId 
                      ? `There are no posts in the selected category.` 
                      : `No posts have been published yet.`}
                  </p>
                  {selectedCategoryId && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCategoryId(null)}
                    >
                      View all posts
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts?.map(post => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <Link href={`/post/${post.slug}`}>
                            <CardTitle className="text-xl mb-1 hover:text-indigo-600 cursor-pointer">
                              {post.title}
                            </CardTitle>
                          </Link>
                          <Badge variant="outline">
                            {getCategoryName(post.categoryId)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          By <Link href={`/author/${post.authorId}`}>
                            <a className="text-indigo-600 hover:underline">{getAuthorName(post.authorId)}</a>
                          </Link>
                          {post.publishedAt && (
                            <span> • {formatDate(post.publishedAt)}</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-gray-600 line-clamp-3">
                          {post.excerpt || post.content.substring(0, 150) + "..."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/post/${post.slug}`}>
                          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 p-0">
                            Read more →
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          
          {categoriesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {categories?.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "ghost"}
                  className={`w-full justify-start ${selectedCategoryId === category.id ? '' : 'text-gray-600'}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Button>
              ))}
              {selectedCategoryId && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-indigo-600 mt-2"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  View all posts
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}