import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import PostsList from "./pages/admin/PostsList";
import QuickPost from "./pages/admin/QuickPost";
import UrlPost from "./pages/admin/UrlPost";
import EditorPost from "./pages/admin/EditorPost";
import MediaManager from "./pages/admin/MediaManager";
import TagManager from "./pages/admin/TagManager";
import ProfileEdit from "./pages/admin/ProfileEdit";
import CategoryManager from "./pages/admin/CategoryManager";
import RssFeedManager from "./pages/admin/RssFeedManager";
import SiteCustomizer from "./pages/admin/SiteCustomizer";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<PostsList />} />
              <Route path="quick-post" element={<QuickPost />} />
              <Route path="url-post" element={<UrlPost />} />
              <Route path="editor-post" element={<EditorPost />} />
              <Route path="media" element={<MediaManager />} />
              <Route path="tags" element={<TagManager />} />
              <Route path="profile" element={<ProfileEdit />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="rss-feeds" element={<RssFeedManager />} />
              <Route path="site-customizer" element={<SiteCustomizer />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
