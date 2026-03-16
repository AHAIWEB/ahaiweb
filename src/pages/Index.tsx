import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import LeftSidebar from "@/components/LeftSidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column */}
          <aside className="lg:col-span-3 space-y-4">
            <ProfileCard />
            <LeftSidebar />
          </aside>

          {/* Main Column */}
          <main className="lg:col-span-6">
            <MainContent />
          </main>

          {/* Right Column */}
          <aside className="lg:col-span-3">
            <RightSidebar />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>© ২০২৬ AHAiWEB — সর্বস্বত্ব সংরক্ষিত</p>
      </footer>
    </div>
  );
};

export default Index;
