import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          About Invitation Home Rentals
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          At Invitation Home Rentals, we unlock more than just doors — we unlock dreams.
          Our mission is to connect people to places they’ll love, whether it is
          a cozy home, a new investment, or the next chapter of your life.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Who We Are</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-2 text-sm">
            <p>
              Invitation Home Rentals is a forward-thinking real estate firm based in
              Texas. We specialize in helping families, individuals, and
              investors find properties that meet their unique needs and
              aspirations.
            </p>
            <p>
              With a dedicated team of professionals and a client-first
              approach, we’ve grown into one of the most trusted names in
              regional real estate.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What We Offer</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-2 text-sm">
            <ul className="list-disc list-inside space-y-1">
              <li>Residential & Commercial Sales</li>
              <li>Property Listings & MLS Integration</li>
              <li>Virtual Tours & Photo Staging</li>
              <li>Investment & Market Insights</li>
              <li>Personalized Agent Matching</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center shadow">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Our Office</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-primary" />
            <span>7155 Old Katy Rd Ste N210, Houston, TX 77024</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-primary" />
            <span>(832) 555-7890</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-primary" />
            <span>contact@InvitationHomerealty.com</span>
          </div>
        </div>

        <div>
          <Button className="bg-primary text-white hover:bg-primary/90">
            Contact Us
          </Button>
        </div>
      </section>

      <section className="text-center mt-10">
        <Badge className="bg-primary text-white px-4 py-1 text-sm rounded-full">
          Driven by Trust. Built on Relationships.
        </Badge>
      </section>
    </main>
  );
}
