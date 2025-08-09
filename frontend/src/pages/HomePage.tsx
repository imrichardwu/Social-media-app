import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Users, Star, Loader, Plus } from "lucide-react";
import { useAuth } from "../components/context/AuthContext";
import { useCreatePost } from "../components/context/CreatePostContext";
import { usePosts } from "../components/context/PostsContext";
import type { Entry } from "../types/models";
import PostCard from "../components/PostCard";
import AnimatedButton from "../components/ui/AnimatedButton";
import AnimatedGradient from "../components/ui/AnimatedGradient";
import Card from "../components/ui/Card";
import { entryService } from "../services/entry";
import { api } from "../services/api";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { openCreatePost } = useCreatePost();
  const { refreshTrigger } = usePosts();
  const [feed, setFeed] = useState<"all" | "friends" | "liked">(
    "all"
  );
  const [posts, setPosts] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [feed, refreshTrigger]); // Add refreshTrigger as dependency

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let response = null;

      switch (feed) {
        case "all":
          response = await entryService.getEntries({
            page: 1,
            page_size: 20,
          });
          break;

        case "friends":
          if (user) {
            response = await entryService.getHomeFeed({
              page: 1,
              page_size: 20,
            });
          } else {
            response = { results: [] };
          }
          break;

        case "liked":
          response = await api.getLikedEntries({
            page: 1,
            page_size: 20,
          });
          break;

        default:
          response = await entryService.getEntries({
            page: 1,
            page_size: 20,
          });
      }

      if (response && response.results) {
        setPosts(response.results);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex justify-center items-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="glass-card-main rounded-full p-5 shadow-lg"
          >
            <Loader className="w-8 h-8 text-brand-500" />
          </motion.div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <Card
          variant="main"
          className="text-center py-16 px-0 flex-1 flex flex-col justify-center"
        >
          <div className="flex justify-center mb-4">
            <Globe size={48} className="text-text-2" />
          </div>
          <h3 className="font-medium text-lg mb-2">No posts found</h3>
          <p className="text-text-2 mb-4">
            {feed === "friends"
              ? "Follow more people to see their posts here"
              : feed === "liked"
              ? "Posts you like will appear here"
              : "Be the first to create a post!"}
          </p>
          {feed === "all" && (
            <AnimatedButton
              onClick={() => openCreatePost()}
              icon={<Plus size={18} />}
              className="max-w-xs mx-auto"
            >
              Create Post
            </AnimatedButton>
          )}
        </Card>
      );
    }

    return (
      <div className="space-y-4 flex-1">
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <PostCard
                post={post}
                isLiked={post.is_liked}
                onDelete={(deletedId) => {
                  setPosts((prev) => prev.filter((p) => p.id !== deletedId));
                }}
                onUpdate={(updatedPost) => {
                  setPosts((prev) =>
                    prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                  );
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6 max-w-4xl mx-auto flex flex-col flex-1">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-1">
          {feed === "friends"
            ? "Friends Feed"
            : feed === "liked"
            ? "Liked Posts"
            : "Social Stream"}
        </h1>

        {/* Feed Tabs */}
        <div className="bg-[rgba(var(--glass-rgb),0.4)] backdrop-blur-md rounded-xl p-1 inline-flex border border-[var(--border-1)] gap-1">
          {[
            { id: "all", label: "All", icon: Globe, gradient: "from-[var(--primary-purple)] via-[var(--primary-pink)] to-[var(--primary-violet)]" },
            { id: "friends", label: "Friends", icon: Users, gradient: "from-[var(--primary-teal)] via-[var(--primary-blue)] to-[var(--primary-purple)]" },
            { id: "liked", label: "Liked", icon: Star, gradient: "from-[var(--primary-coral)] via-[var(--primary-yellow)] to-[var(--primary-pink)]" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = feed === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setFeed(tab.id as "all" | "friends" | "liked")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  transition-all duration-300
                  ${
                    isActive
                      ? "text-white"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFeedTab"
                    className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.gradient} shadow-lg animate-gradient-slow`}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="font-medium text-sm relative z-10">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* New Post Button */}
      {(feed === "all" || feed === "friends") && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AnimatedButton
            onClick={() => openCreatePost()}
            variant="primary"
            size="lg"
            icon={<Plus size={20} />}
            className="w-full"
            animationDuration={15}
          >
            Create New Post
          </AnimatedButton>
        </motion.div>
      )}

      {/* Posts */}
      <div className="flex-1 flex flex-col">{renderContent()}</div>
    </div>
  );
};

export default HomePage;
