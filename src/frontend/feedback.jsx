import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call here to store in DB / analytics
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section
      id="feedback"
      className="bg-gradient-to-b from-[#1C94B5] via-[#1C94B5]/90 to-[#E6F4F8] py-20"
    >
      <div className="max-w-3xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <MessageCircle className="mx-auto h-12 w-12 text-[#1C94B5]" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-4">
            We’d love your feedback
          </h2>
          <p className="mt-2 text-gray-700">
            Your insights help us make Conseccomms better. Share your thoughts below.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-3xl p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Feedback / Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C94B5] resize-none"
                placeholder="Share your thoughts, suggestions, or issues..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#1C94B5] to-[#187a95] text-white font-semibold rounded-xl shadow hover:from-[#166d86] hover:to-[#1C94B5] transition"
            >
              Submit Feedback
            </button>

            {submitted && (
              <p className="text-[#1C94B5] font-medium mt-2 text-center animate-pulse">
                ✅ Feedback submitted successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
