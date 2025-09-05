import { useState } from "react";

export default function ContactDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Placeholder: connect this to your backend API to save in DB and send email
    try {
      console.log("Submitting form data:", formData);

      // Example: POST to backend endpoint
      // await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      setSubmitted(true);
      setFormData({ name: "", email: "", company: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <section className="bg-gray-50 py-20" id="contact">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Contact & Demo Request
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Fill out the form and we’ll get back to you shortly.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-md space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>

          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Message"
            rows="5"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />

          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0d9488] transition"
          >
            Send Request
          </button>

          {submitted && (
            <p className="text-green-600 text-center mt-4">
              Thank you! Your request has been submitted.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
