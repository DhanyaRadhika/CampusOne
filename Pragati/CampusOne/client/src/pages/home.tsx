import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import heroImage from "@assets/generated_images/modern_university_campus_building_with_students.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt="Campus Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            CampusOne 2.0 is Live
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
            Intelligent College <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Engagement Platform
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The unified ecosystem for students, faculty, and administration.
            Manage events, track placements, and boost campus engagement with
            AI-driven insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link href="/auth">
              <Button
                size="lg"
                className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-lg rounded-full border-2"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Calendar}
              title="Smart Event Management"
              description="Discover, register, and track campus events. AI recommendations based on your skills and interests."
            />
            <FeatureCard
              icon={Users}
              title="Faculty Dashboard"
              description="Streamlined attendance taking, event creation, and student performance tracking in one place."
            />
            <FeatureCard
              icon={BarChart3}
              title="Placement Intelligence"
              description="Real-time analytics on student skills, participation, and placement readiness for the admin office."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat number="50+" label="Active Clubs" />
            <Stat number="1200+" label="Students" />
            <Stat number="500+" label="Events Hosted" />
            <Stat number="95%" label="Placement Rate" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="group p-8 rounded-2xl border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Stat({ number, label }: any) {
  return (
    <div>
      <div className="text-4xl font-heading font-bold text-primary mb-2">
        {number}
      </div>
      <div className="text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
