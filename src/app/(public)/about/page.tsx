import {
  Building2,
  Shield,
  Target,
  Eye,
  Users,
  BarChart3,
  Award,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us",
  description:
    "Learn about the City Population & Household Survey System — our mission, vision, and commitment to building smarter cities through data.",
};

const values = [
  {
    icon: Shield,
    title: "Data Privacy",
    description:
      "We prioritize the privacy and security of every citizen's personal information with enterprise-grade encryption.",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description:
      "Designed for everyone — multilingual support ensures no citizen is left behind regardless of language barriers.",
  },
  {
    icon: BarChart3,
    title: "Transparency",
    description:
      "All aggregated statistics are publicly accessible, promoting open governance and citizen trust.",
  },
  {
    icon: Award,
    title: "Accuracy",
    description:
      "Rigorous validation and verification processes ensure data quality for reliable policy-making.",
  },
];

const team = [
  { role: "Municipal Commissioner", description: "Overall project oversight and policy direction" },
  { role: "IT Department", description: "Platform development and technical infrastructure" },
  { role: "Survey Department", description: "Field data collection and verification" },
  { role: "Statistics Department", description: "Data analysis and reporting" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero text-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
              About the City Survey System
            </h1>
            <p className="mt-6 text-lg text-white/75 leading-relaxed">
              A transformative digital initiative by the City Municipal
              Corporation to modernize population data collection and empower
              data-driven governance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-primary/15 animate-fade-in">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 mb-5">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To create a comprehensive, accurate, and accessible digital
                  record of every household in our city. We aim to replace
                  outdated paper-based surveys with a modern platform that
                  empowers both citizens and administrators with real-time data
                  and actionable insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/15 animate-fade-in stagger-2">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/8 mb-5">
                  <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
                  Our Vision
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the model smart-city survey platform in India — a
                  benchmark for how municipalities can leverage technology to
                  understand their population, plan resources effectively, and
                  deliver better public services to every ward and neighborhood.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              Our Core Values
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              The principles that guide every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card
                key={value.title}
                className="text-center border-border/50 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              Behind the Initiative
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A cross-department collaboration within the Municipal Corporation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Card
                key={member.role}
                className="border-border/50 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/8 mx-auto mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold font-[family-name:var(--font-heading)]">
                    {member.role}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 gradient-primary text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-10 w-10 mx-auto mb-6 text-white/60" />
          <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Making a Difference
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Every household survey contributes to better urban planning,
            resource allocation, and public service delivery. Together, we are
            building a smarter, more inclusive city.
          </p>
        </div>
      </section>
    </div>
  );
}
