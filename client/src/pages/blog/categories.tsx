import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category, Post } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CategoriesProps {
  categorySlug?: string;
}

export default function Categories({ categorySlug }: CategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch all categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // If categorySlug is provided, find the matching category
  useEffect(() => {
    if (categorySlug && categories) {
      const category = categories.find(c => c.slug === categorySlug);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categorySlug, categories]);

  // Fetch posts based on category filter
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['/api/posts/category', selectedCategory?.id],
    queryFn: () => selectedCategory ? 
      fetch(`/api/posts/category/${selectedCategory.id}`).then(res => res.json()) :
      fetch('/api/posts').then(res => res.json()),
    enabled: !categoriesLoading,
  });

  // Format date
  const formatDate = (date: Date | null) => {
    return date ? format(new Date(date), 'MMMM dd, yyyy') : '';
  };

  if (categoriesError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading categories</h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading posts</h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  // If viewing a specific category
  if (selectedCategory) {
    return (
      <div>
        <div className="mb-8">
          <Link href="/categories">
            <a className="text-indigo-600 hover:text-indigo-800 text-sm">
              ← Back to all categories
            </a>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{selectedCategory.name}</h1>
          {selectedCategory.description && (
            <p className="text-gray-600">{selectedCategory.description}</p>
          )}
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
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
            {!posts || posts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">No posts in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map(post => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <Link href={`/post/${post.slug}`}>
                        <CardTitle className="text-xl hover:text-indigo-600 cursor-pointer">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <CardDescription>
                        {post.publishedAt && formatDate(post.publishedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3">
                        {post.excerpt || post.content.substring(0, 150) + "..."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/post/${post.slug}`}>
                        <a className="text-indigo-600 hover:text-indigo-800">
                          Read more →
                        </a>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Main categories view
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>

      {categoriesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {!categories || categories.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-indigo-100">
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      {category.description && (
                        <CardDescription>{category.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter>
                      <Badge variant="outline">
                        View posts
                      </Badge>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}