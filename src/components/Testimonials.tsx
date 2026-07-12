"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto text-center space-y-10">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-5xl font-bold text-primary">
          About Invitation Home Rentals
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-base">
          At Invitation Home Rentals, we unlock more than just doors — we unlock dreams.
          Our mission is to connect people to places they’ll love, whether it’s
          a cozy home, a smart investment, or a fresh start.
        </p>
      </div>

      {/* Testimonials embedded in hero */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[
          {
            name: "Jessica M.",
            text: "Invitation Home Rentals helped me find my dream home in just two weeks. Honest, responsive, and genuinely caring!",
          },
          {
            name: "Daniel K.",
            text: "A seamless experience from start to finish. The team made the entire process feel easy.",
          },
          {
            name: "Amina R.",
            text: "As a first-time investor, I needed guidance. Invitation Home Rentals gave me data, insights, and peace of mind.",
          },
        ].map((testimonial, index) => (
          <Card key={index} className="bg-white shadow-md">
            <CardContent className="p-6 space-y-4">
              <Quote className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-700 italic">
                &apos;{testimonial.text} &apos;
              </p>
              <p className="text-sm font-medium text-gray-900">
                — {testimonial.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
