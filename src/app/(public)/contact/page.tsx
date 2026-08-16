import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the City Survey team. Submit inquiries, report issues, or request assistance.",
};

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    details: [
      "City Municipal Corporation",
      "Main Administrative Building",
      "Smart City - 560001",
    ],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 1800-XXX-XXXX (Toll Free)", "+91 80-XXXX-XXXX (Office)"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["support@citysurvey.local", "grievances@citysurvey.local"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: [
      "Monday – Friday: 9:00 AM – 5:30 PM",
      "Saturday: 10:00 AM – 2:00 PM",
      "Sunday: Closed",
    ],
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero text-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
              Contact Us
            </h1>
            <p className="mt-6 text-lg text-white/75 leading-relaxed">
              Have questions or need assistance? Our team is here to help you
              with any inquiries about the survey process.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <Card className="lg:col-span-3 animate-fade-in">
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-heading)]">
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Full Name</Label>
                      <Input id="contact-name" placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email Address</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">Subject</Label>
                      <Select>
                        <SelectTrigger id="contact-subject">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="survey">
                            Survey Related
                          </SelectItem>
                          <SelectItem value="technical">
                            Technical Support
                          </SelectItem>
                          <SelectItem value="correction">
                            Data Correction
                          </SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="grievance">Grievance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Describe your inquiry in detail..."
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="gradient-primary border-0 text-white shadow-md shadow-primary/25 h-11 px-6"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              {contactInfo.map((item, i) => (
                <Card
                  key={item.title}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-1">
                          {item.title}
                        </h3>
                        {item.details.map((detail) => (
                          <p
                            key={detail}
                            className="text-sm text-muted-foreground"
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
