export default function WhyChooseUs() {
  const features = [
    {
      title: "Hyper-Local Expertise",
      icon: "🧭",
      desc: "We know your neighborhood inside out, helping you make informed decisions.",
    },
    {
      title: "Elite Agents",
      icon: "💼",
      desc: "Licensed professionals who prioritize your needs and guide you every step of the way.",
    },
    {
      title: "Smooth Closings",
      icon: "📝",
      desc: "From contracts to compliance, we ensure a seamless, stress-free process.",
    },
    {
      title: "Exclusive Listings",
      icon: "🏘️",
      desc: "Gain access to premium properties and hidden gems unavailable elsewhere.",
    },
  ];

  return (
    <section className="py-20 bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why Choose <span className="text-primary">Invitation Home Rentals?</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          Experience unmatched service, market insight, and access to premium
          listings. Here is why clients trust us to guide them home.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, i) => (
            <div
              key={i}
              className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-border flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary text-3xl">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
