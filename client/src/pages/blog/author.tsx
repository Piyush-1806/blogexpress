import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Post } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AuthorPageProps {
  authorId: number;
}

export default function AuthorPage({ authorId }: AuthorPageProps) {
  // Fetch the author
  const { data: author, isLoading: authorLoading, error: authorError } = useQuery<User>({
    queryKey: ['/api/users', authorId],
    queryFn: () => fetch(`/api/users/${authorId}`).then(res => res.json()),
  });

  // Fetch posts by this author
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['/api/posts/author', authorId],
    queryFn: () => fetch(`/api/posts/author/${authorId}`).then(res => res.json()),
    enabled: !!authorId,
  });

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format date
  const formatDate = (date: Date | null) => {
    return date ? format(new Date(date), 'MMMM dd, yyyy') : '';
  };

  if (authorError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Author not found</h2>
        <p className="text-gray-600 mb-6">The requested author could not be found.</p>
        <Link href="/">
          <a className="text-indigo-600 hover:text-indigo-800">
            Back to Home
          </a>
        </Link>
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

  return (
    <div>
      {/* Author Info */}
      <div className="mb-10">
        {authorLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        ) : author ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={author.avatar || ""} />
              <AvatarFallback className="text-xl">{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
              {author.bio && (
                <p className="text-gray-600">{author.bio}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Posts by Author */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts by {author?.name}</h2>

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
                <p className="text-gray-600">No posts by this author yet</p>
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
    </div>
  );
}