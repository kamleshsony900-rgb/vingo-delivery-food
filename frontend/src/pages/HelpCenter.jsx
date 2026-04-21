import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const HelpCenter = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const faqs = [
        {
            question: "How can I track my order?",
            answer: "Go to your orders page and enter your Order ID to track delivery status.",
        },
        {
            question: "How do I submit feedback?",
            answer: "You can submit feedback using our Contact/Feedback form.",
        },
        {
            question: "Can I upload an image with feedback?",
            answer: "Yes, you can upload screenshots or images while submitting feedback.",
        },
        {
            question: "How long does it take to get a response?",
            answer: "Our team usually responds within 24-48 hours.",
        },
        {
            question: "What if I entered wrong details?",
            answer: "You can submit a new request or contact support for correction.",
        },
    ];

    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fff9f6] px-4 py-10">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <h1 className="text-3xl font-bold text-center text-[#ff4d2d] mb-6">
                    Help Center
                </h1>

                {/* Search */}
                <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm mb-6">
                    <Search className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search help..."
                        className="w-full outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, i) => (
                            <details
                                key={i}
                                className="bg-white p-4 rounded-lg shadow cursor-pointer"
                            >
                                <summary className="font-semibold text-gray-800">
                                    {faq.question}
                                </summary>
                                <p className="text-gray-600 mt-2">{faq.answer}</p>
                            </details>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No results found</p>
                    )}
                </div>

                {/* Contact CTA */}
                <div className="mt-10 text-center bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-2">
                        Still need help?
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Our support team is here for you.
                    </p>
                    <button
                        onClick={() => navigate("/feedback")}
                        className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                        Contact Support
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HelpCenter;