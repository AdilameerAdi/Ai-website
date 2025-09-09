import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaDownload, FaArchive, FaCheck, FaReply } from "react-icons/fa";
import { supabase } from "../lib/supabase"; // adjust path
import jsPDF from "jspdf";

const AdminFeedback= () => {

  // State
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [responseText, setResponseText] = useState({}); // store per feedback admin response

  // ✅ Fetch feedback + user details
  const fetchFeedback = async () => {
    setLoading(true);

    // Feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError.message);
      setLoading(false);
      return;
    }

    // Users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*");

    if (userError) {
      console.error("Error fetching users:", userError.message);
      setLoading(false);
      return;
    }

    // Merge feedback with user info
    const merged = feedbackData.map((fb) => {
      const user = userData.find((u) => u.id === fb.user_id);
      return {
        ...fb,
        user_full_name: user?.full_name || "Unknown",
        user_email: user?.email || fb.user_email,
        user_role: user?.role || "user",
      };
    });

    setFeedbackList(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // ✅ Resolve feedback
  const handleResolveFeedback = async (id) => {
    const { error } = await supabase.from("feedback").update({ status: "resolved" }).eq("id", id);
    if (error) console.error("Error resolving feedback:", error.message);
    else fetchFeedback();
  };

  // ✅ Archive feedback
  const handleArchiveFeedback = async (id) => {
    const { error } = await supabase.from("feedback").update({ status: "archived" }).eq("id", id);
    if (error) console.error("Error archiving feedback:", error.message);
    else fetchFeedback();
  };

  // ✅ Admin respond
  const handleRespond = async (id) => {
    const text = responseText[id];
    if (!text) return alert("Please enter a response.");

    const adminId = "admin-uuid"; // 🔹 Replace with logged-in admin id

    const { error } = await supabase
      .from("feedback")
      .update({
        admin_response: text,
        admin_user_id: adminId,
        admin_responded_at: new Date().toISOString(),
        status: "responded",
      })
      .eq("id", id);

    if (error) {
      console.error("Error responding to feedback:", error.message);
    } else {
      setResponseText((prev) => ({ ...prev, [id]: "" }));
      fetchFeedback();
    }
  };

  // ✅ Export CSV
  const handleExportCSV = () => {
    const headers =
      "id,user_name,user_email,category,subject,message,priority,status,ai_sentiment,ai_category,ai_urgency,ai_confidence,ai_suggested_response,admin_response,user_rating,tags,follow_up_required\n";

    const csvData =
      headers +
      feedbackList
        .map(
          (f) =>
            `${f.id},${f.user_full_name},${f.user_email},${f.category},${f.subject},${f.message},${f.priority},${f.status},${f.ai_sentiment},${f.ai_category},${f.ai_urgency},${f.ai_confidence},${f.ai_suggested_response},${f.admin_response || ""},${f.user_rating || ""},${f.tags || ""},${f.follow_up_required}`
        )
        .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Feedback Report", 10, 10);

    feedbackList.slice(0, 20).forEach((f, i) => {
      doc.text(
        `${i + 1}. ${f.user_full_name} (${f.user_email}) - ${f.category} - ${f.subject}`,
        10,
        20 + i * 8
      );
    });

    doc.save("feedback_report.pdf");
  };

  // ✅ Filtering + Search
  const filteredResults = feedbackList
    .filter((f) => selectedCategory === "all" || f.category === selectedCategory)
    .filter(
      (f) =>
        f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.user_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
        >
          <FaArrowLeft /> Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600"
          >
            <FaDownload /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
          >
            <FaDownload /> Export PDF
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-center text-gray-500">Loading feedback...</p>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <select
              className="border rounded-lg px-3 py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(feedbackList.map((f) => f.category))).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search feedback..."
              className="border rounded-lg px-3 py-2 flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Feedback list */}
          <div className="grid gap-4">
            {filteredResults.map((f) => (
              <div key={f.id} className="p-4 border rounded-lg shadow-sm bg-white">
                <h3 className="font-semibold text-lg">
                  {f.subject}{" "}
                  <span className="text-sm text-gray-400">({f.category})</span>
                </h3>
                <p className="text-gray-600">{f.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  By <strong>{f.user_full_name}</strong> ({f.user_email}) | Role:{" "}
                  {f.user_role}
                </p>
                <p className="text-sm text-gray-400">
                  Priority: {f.priority} | Status: {f.status} | Sentiment:{" "}
                  {f.ai_sentiment} ({f.ai_confidence})
                </p>
                {f.ai_suggested_response && (
                  <p className="text-sm text-blue-600 mt-1">
                    💡 Suggested: {f.ai_suggested_response}
                  </p>
                )}
                {f.admin_response && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Admin Response: {f.admin_response}
                  </p>
                )}

                {/* Admin respond input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Write a response..."
                    value={responseText[f.id] || ""}
                    onChange={(e) =>
                      setResponseText((prev) => ({ ...prev, [f.id]: e.target.value }))
                    }
                    className="border rounded-lg px-3 py-1 flex-1"
                  />
                  <button
                    onClick={() => handleRespond(f.id)}
                    className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600"
                  >
                    <FaReply /> Respond
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleResolveFeedback(f.id)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                  >
                    <FaCheck /> Resolve
                  </button>
                  <button
                    onClick={() => handleArchiveFeedback(f.id)}
                    className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                  >
                    <FaArchive /> Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFeedback;
