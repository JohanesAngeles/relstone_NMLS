import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import Layout from "../../components/Layout";
import {
  X,
  Send,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  HelpCircle,
  BookOpen,
  CreditCard,
  Award,
  User,
  Search,
} from "lucide-react";

const CATEGORIES = [
  { key: "technical", label: "Technical Issue", icon: <AlertCircle size={16} />, color: "#EF4444" },
  { key: "billing", label: "Billing & Payment", icon: <CreditCard size={16} />, color: "#F59E0B" },
  { key: "course", label: "Course Question", icon: <BookOpen size={16} />, color: "#2EABFE" },
  { key: "certificate", label: "Certificate", icon: <Award size={16} />, color: "#008000" },
  { key: "account", label: "Account & Profile", icon: <User size={16} />, color: "#9569F7" },
  { key: "other", label: "Other", icon: <HelpCircle size={16} />, color: "#5B7384" },
];

const PRIORITIES = [
  { key: "low", label: "Low", color: "#5B7384" },
  { key: "normal", label: "Normal", color: "#2EABFE" },
  { key: "high", label: "High", color: "#F59E0B" },
  { key: "urgent", label: "Urgent", color: "#EF4444" },
];

const FAQS = [
  {
    id: "course-access",
    category: "course",
    question: "How do I access my purchased or assigned course?",
    answer:
      "After logging in, open My Courses to view your enrolled or assigned courses. If you recently completed a purchase, allow a short processing time and then check My Orders to confirm the transaction. If the course still does not appear, submit a support ticket with your course name and order details.",
    keywords: ["my courses", "course access", "enrollment", "assigned course"],
  },
  {
    id: "course-loading",
    category: "technical",
    question: "What should I do if a course is not loading properly?",
    answer:
      "First refresh the page, sign out and sign back in, and make sure your internet connection is stable. If the issue continues, try another browser or device. When submitting a ticket, include the course title, a screenshot if possible, and the exact error message you encountered.",
    keywords: ["not loading", "technical issue", "error", "course problem"],
  },
  {
    id: "certificate-download",
    category: "certificate",
    question: "Where can I download or verify my certificate?",
    answer:
      "Go to the Certificates section after completing all required course steps. Your available certificate should appear there for download or verification. If it is missing, make sure the course is fully completed and that any required processing has finished before contacting support.",
    keywords: ["certificate", "download", "verify", "completion"],
  },
  {
    id: "payment-missing",
    category: "billing",
    question: "Why is my payment not showing in the system?",
    answer:
      "Payments may take a short time to reflect in your account depending on the payment method used. Check My Orders first to confirm whether the purchase was recorded. If the payment still does not appear, submit a billing ticket and include your order number, payment date, and proof of payment if available.",
    keywords: ["payment", "billing", "order", "proof of payment"],
  },
  {
    id: "account-update",
    category: "account",
    question: "How do I update my account or profile information?",
    answer:
      "Open My Profile to review and update your personal information and preferences. If a field cannot be edited or your changes are not saving correctly, create an Account & Profile support ticket with a short description of the issue.",
    keywords: ["account", "profile", "update info", "edit profile"],
  },
  {
    id: "certificate-delay",
    category: "certificate",
    question: "Why is my certificate not available yet even though I finished the course?",
    answer:
      "Your certificate may not appear immediately if the course still has incomplete steps, verification checks, or completion processing in progress. Recheck the course progress page to confirm all lessons, quizzes, or required actions are complete. If everything is finished and the certificate is still unavailable, contact support.",
    keywords: ["certificate missing", "certificate delay", "completed course"],
  },
  {
    id: "billing-receipt",
    category: "billing",
    question: "Where can I find my receipt or order history?",
    answer:
      "You can review your purchases in My Orders. This section is the best place to confirm transaction history and look for payment-related details before opening a support request.",
    keywords: ["receipt", "orders", "purchase history", "billing history"],
  },
  {
    id: "support-category",
    category: "other",
    question: "Which support category should I choose when creating a ticket?",
    answer:
      "Choose the category that is closest to your issue. Use Technical Issue for platform problems, Billing & Payment for transactions, Course Question for course access or progress concerns, Certificate for certificate-related issues, and Account & Profile for user account concerns. If you are unsure, choose Other and explain your concern clearly.",
    keywords: ["support category", "ticket category", "other"],
  },
  {
    id: "login-trouble",
    category: "account",
    question: "What should I do if I cannot access my account?",
    answer:
      "Double-check your login credentials and try signing in again. If the issue continues, make sure you are using the correct account and browser. If you still cannot access the portal, create an Account & Profile ticket and include the email address connected to your account.",
    keywords: ["login", "sign in", "account access", "cannot access account"],
  },
  {
    id: "course-question",
    category: "course",
    question: "Who should I contact if I have a question about a course requirement?",
    answer:
      "Use the Course Question category when you need help understanding course-related requirements, completion steps, or missing content. Provide the exact course name and explain the part that is unclear so the support team can respond faster.",
    keywords: ["course requirement", "course help", "question"],
  },
];

const ContactSupport = () => {
  const { user } = useAuth();

  const [view, setView] = useState("list");
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [faqQuery, setFaqQuery] = useState("");
  const [faqCategory, setFaqCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(FAQS[0]?.id || null);

  const [form, setForm] = useState({
    subject: "",
    category: "other",
    priority: "normal",
    message: "",
  });

  const faqCounts = useMemo(() => {
    return FAQS.reduce((acc, faq) => {
      acc[faq.category] = (acc[faq.category] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const filteredFaqs = useMemo(() => {
    const query = faqQuery.trim().toLowerCase();

    return FAQS.filter((faq) => {
      const matchesCategory = faqCategory === "all" || faq.category === faqCategory;

      const haystack = [
        faq.question,
        faq.answer,
        faq.keywords?.join(" "),
        CATEGORIES.find((c) => c.key === faq.category)?.label || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [faqQuery, faqCategory]);

  useEffect(() => {
    if (!filteredFaqs.length) {
      setOpenFaqId(null);
      return;
    }

    const stillVisible = filteredFaqs.some((faq) => faq.id === openFaqId);

    if (!stillVisible) {
      setOpenFaqId(filteredFaqs[0].id);
    }
  }, [filteredFaqs, openFaqId]);

  const loadTickets = async () => {
    setLoading(true);

    try {
      const res = await API.get("/support/mine");
      setTickets(res.data?.tickets || []);
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await API.post("/support", form);

      setSuccess("Your support ticket has been submitted! We'll get back to you soon.");
      setForm({
        subject: "",
        category: "other",
        priority: "normal",
        message: "",
      });

      await loadTickets();

      setTimeout(() => {
        setSuccess("");
        setView("list");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = async (ticket) => {
    setSelected(ticket);
    setView("detail");

    try {
      const res = await API.get(`/support/${ticket._id}`);
      setSelected(res.data?.ticket || ticket);
    } catch {
      /* use cached ticket */
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;

    setReplyLoading(true);

    try {
      const res = await API.post(`/support/${selected._id}/reply`, { message: replyText });
      setSelected(res.data?.ticket);
      setReplyText("");
      setTickets((prev) =>
        prev.map((t) => (t._id === selected._id ? res.data.ticket : t))
      );
    } catch {
      setError("Failed to send reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  const openNewTicket = ({ category = "other", subject = "" } = {}) => {
    setForm((prev) => ({
      ...prev,
      category,
      subject: subject || prev.subject,
    }));
    setError("");
    setSuccess("");
    setView("new");
  };

  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;

  return (
    <Layout>
      <style>{css}</style>

      <div style={S.wrap}>
        <div style={S.pageHeader}>
          <div style={S.headerIcon}>
            <HelpCircle size={22} style={{ color: "#2EABFE" }} />
          </div>

          <div>
            <div style={S.pageTitle}>Help Center & Contact Support</div>
            <div style={S.pageSub}>
              Search common answers, browse help topics, or submit a support ticket.
            </div>
          </div>

          {openCount > 0 && (
            <div style={S.openBadge}>
              <Clock size={11} /> {openCount} open ticket{openCount !== 1 ? "s" : ""}
            </div>
          )}

          {view === "list" ? (
            <button
              style={S.newTicketBtn}
              onClick={() => openNewTicket()}
              type="button"
            >
              <Plus size={13} /> New Ticket
            </button>
          ) : (
            <button
              style={S.backLinkBtn}
              onClick={() => {
                setView("list");
                setSelected(null);
                setError("");
              }}
              type="button"
            >
              ← Back to support
            </button>
          )}
        </div>

        <div style={S.headDivider} />

        {view === "new" && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={S.cardTitle}>Submit a Support Request</div>
              <button
                style={S.closeBtn}
                onClick={() => {
                  setView("list");
                  setError("");
                }}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {success && (
              <div style={S.successBanner}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} />
                {success}
              </div>
            )}

            {error && (
              <div style={S.errorBanner}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div style={S.fieldGroup}>
              <div style={S.fieldLabel}>
                Category <span style={{ color: "#EF4444" }}>*</span>
              </div>

              <div style={S.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.key }))}
                    style={{
                      ...S.categoryBtn,
                      ...(form.category === cat.key
                        ? {
                            borderColor: cat.color,
                            color: cat.color,
                            background: `${cat.color}12`,
                            fontWeight: 800,
                          }
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        color:
                          form.category === cat.key
                            ? cat.color
                            : "rgba(11,18,32,0.45)",
                      }}
                    >
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={S.fieldGroup}>
              <div style={S.fieldLabel}>Priority</div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRIORITIES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: p.key }))}
                    style={{
                      ...S.priorityBtn,
                      ...(form.priority === p.key
                        ? {
                            background: `${p.color}15`,
                            border: `1px solid ${p.color}`,
                            color: p.color,
                          }
                        : {}),
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="subject">
                Subject <span style={{ color: "#EF4444" }}>*</span>
              </label>

              <input
                id="subject"
                style={S.input}
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Brief description of your issue..."
                maxLength={120}
              />

              <div style={S.charCount}>{form.subject.length}/120</div>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="message">
                Message <span style={{ color: "#EF4444" }}>*</span>
              </label>

              <textarea
                id="message"
                style={S.textarea}
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Please describe your issue in detail. Include any error messages, course names, or order numbers..."
              />

              <div style={S.charCount}>{form.message.length} characters</div>
            </div>

            <div style={S.formFooter}>
              <button
                style={S.cancelBtn}
                onClick={() => {
                  setView("list");
                  setError("");
                }}
                type="button"
              >
                Cancel
              </button>

              <button
                style={{
                  ...S.submitBtn,
                  ...(submitting ? { opacity: 0.7, cursor: "not-allowed" } : {}),
                }}
                onClick={handleSubmit}
                disabled={submitting}
                type="button"
              >
                {submitting ? (
                  <>
                    <span className="cs-spin-sm" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={13} /> Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {view === "detail" && selected && (
          <div style={S.card}>
            <div style={S.detailMeta}>
              <div style={S.detailSubject}>{selected.subject}</div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                <StatusPill status={selected.status} />
                <PriorityPill priority={selected.priority} />
                <CategoryPill category={selected.category} />
                <span style={S.detailDate}>
                  <Clock size={10} />
                  {new Date(selected.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div style={S.msgBlock}>
              <div style={S.msgAvatar}>
                {(user?.name || "S")[0].toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={S.msgSender}>
                  {selected.user_name || user?.name}
                  <span style={S.msgRole}>Student</span>
                </div>

                <div style={S.msgDate}>
                  {new Date(selected.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div style={S.msgText}>{selected.message}</div>
              </div>
            </div>

            {(selected.replies || []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {selected.replies.map((r, i) => {
                  const isSupport =
                    r.sender_role === "instructor" || r.sender_role === "admin";

                  return (
                    <div
                      key={i}
                      style={{ ...S.msgBlock, ...(isSupport ? S.msgBlockSupport : {}) }}
                    >
                      <div
                        style={{
                          ...S.msgAvatar,
                          ...(isSupport ? S.avatarSupport : {}),
                        }}
                      >
                        {isSupport ? "S" : (r.sender_name || "U")[0].toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={S.msgSender}>
                          {r.sender_name || "User"}
                          <span
                            style={{
                              ...S.msgRole,
                              ...(isSupport
                                ? {
                                    color: "#2EABFE",
                                    background: "rgba(46,171,254,0.10)",
                                    border: "1px solid rgba(46,171,254,0.22)",
                                  }
                                : {}),
                            }}
                          >
                            {isSupport ? "Support" : "You"}
                          </span>
                        </div>

                        <div style={S.msgDate}>
                          {new Date(r.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>

                        <div style={S.msgText}>{r.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selected.status !== "closed" && selected.status !== "resolved" && (
              <div style={S.replyBox}>
                <div style={S.replyLabel}>Add a reply</div>

                <textarea
                  style={S.textarea}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button
                    style={{
                      ...S.submitBtn,
                      ...(replyLoading || !replyText.trim()
                        ? { opacity: 0.55, cursor: "not-allowed" }
                        : {}),
                    }}
                    onClick={handleReply}
                    disabled={replyLoading || !replyText.trim()}
                    type="button"
                  >
                    {replyLoading ? (
                      <>
                        <span className="cs-spin-sm" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {(selected.status === "closed" || selected.status === "resolved") && (
              <div style={S.closedNote}>
                <CheckCircle size={13} style={{ flexShrink: 0 }} />
                This ticket has been {selected.status}
                {selected.status === "resolved"
                  ? ". We hope your issue was resolved!"
                  : "."}{" "}
                Open a new ticket if you need further help.
              </div>
            )}
          </div>
        )}

        {view === "list" && (
          <div>
            {error && (
              <div style={{ ...S.errorBanner, marginBottom: 12 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {success && (
              <div style={{ ...S.successBanner, marginBottom: 12 }}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} />
                {success}
              </div>
            )}

            <div style={S.helpHero}>
              <div style={S.helpHeroTop}>
                <div>
                  <div style={S.sectionTitle}>Search Help Articles & FAQs</div>
                  <div style={S.sectionSub}>
                    Find quick answers before creating a ticket.
                  </div>
                </div>

                <div style={S.helpHeroHint}>Self-service first, support when needed</div>
              </div>

              <div style={S.searchWrap}>
                <Search size={16} style={S.searchIcon} />
                <input
                  value={faqQuery}
                  onChange={(e) => setFaqQuery(e.target.value)}
                  placeholder="Search help articles, certificates, payments, or technical issues..."
                  style={S.searchInput}
                />
              </div>

              <div style={S.quickFilters}>
                <button
                  type="button"
                  onClick={() => setFaqCategory("all")}
                  style={{
                    ...S.quickFilterBtn,
                    ...(faqCategory === "all" ? S.quickFilterBtnActive : {}),
                  }}
                >
                  All Topics
                </button>

                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setFaqCategory(cat.key)}
                    style={{
                      ...S.quickFilterBtn,
                      ...(faqCategory === cat.key ? S.quickFilterBtnActive : {}),
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.sectionBlock}>
              <div style={S.sectionTitle}>Browse Help Topics</div>
              <div style={S.sectionSub}>
                Pick a topic to narrow the FAQ list or jump straight to support.
              </div>

              <div style={S.topicGrid}>
                {CATEGORIES.map((cat) => {
                  const isActive = faqCategory === cat.key;

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      className="cs-topic-card"
                      onClick={() => setFaqCategory(cat.key)}
                      style={{
                        ...S.topicCard,
                        ...(isActive
                          ? {
                              borderColor: `${cat.color}55`,
                              background: `${cat.color}10`,
                              boxShadow: `0 6px 18px ${cat.color}20`,
                            }
                          : {}),
                      }}
                    >
                      <div
                        style={{
                          ...S.topicIcon,
                          color: cat.color,
                          background: `${cat.color}12`,
                          border: `1px solid ${cat.color}30`,
                        }}
                      >
                        {cat.icon}
                      </div>

                      <div style={S.topicLabel}>{cat.label}</div>
                      <div style={S.topicMeta}>{faqCounts[cat.key] || 0} FAQ entries</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={S.sectionBlock}>
              <div style={S.faqHeaderRow}>
                <div>
                  <div style={S.sectionTitle}>Frequently Asked Questions</div>
                  <div style={S.sectionSub}>
                    {faqCategory === "all"
                      ? "Showing answers across all help topics."
                      : `Showing answers for ${
                          CATEGORIES.find((c) => c.key === faqCategory)?.label || "selected topic"
                        }.`}
                  </div>
                </div>

                {faqCategory !== "all" && (
                  <button
                    type="button"
                    style={S.clearFilterBtn}
                    onClick={() => setFaqCategory("all")}
                  >
                    Clear topic filter
                  </button>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <div style={S.faqEmpty}>
                  <div style={S.emptyIcon}>
                    <HelpCircle size={22} style={{ color: "#5B7384" }} />
                  </div>

                  <div style={S.emptyTitle}>No matching FAQ found</div>

                  <div style={S.emptySub}>
                    Try a different keyword, change the selected topic, or contact support
                    directly.
                  </div>

                  <button
                    style={S.newTicketBtn}
                    onClick={() => openNewTicket()}
                    type="button"
                  >
                    <Plus size={12} /> Create Support Ticket
                  </button>
                </div>
              ) : (
                <div style={S.faqList}>
                  {filteredFaqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;

                    return (
                      <div key={faq.id} style={S.faqItem}>
                        <button
                          type="button"
                          className="cs-faq-item-btn"
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          style={S.faqItemBtn}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={S.faqQuestion}>{faq.question}</div>
                            <div style={S.faqItemMeta}>
                              <CategoryPill category={faq.category} />
                            </div>
                          </div>

                          <ChevronDown
                            size={18}
                            style={{
                              ...S.faqChevron,
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        </button>

                        {isOpen && (
                          <div style={S.faqAnswerWrap}>
                            <div style={S.faqAnswer}>{faq.answer}</div>

                            <div style={S.faqActions}>
                              <button
                                type="button"
                                style={S.linkBtn}
                                onClick={() =>
                                  openNewTicket({
                                    category: faq.category,
                                    subject: faq.question,
                                  })
                                }
                              >
                                Still need help? Create a ticket
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={S.ticketCtaCard}>
              <div>
                <div style={S.ticketCtaTitle}>Still need help?</div>
                <div style={S.ticketCtaText}>
                  If the FAQ did not solve your concern, submit a support ticket and
                  our team will get back to you.
                </div>
              </div>

              <button
                style={S.newTicketBtn}
                onClick={() => openNewTicket()}
                type="button"
              >
                <Plus size={13} /> Submit a Ticket
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={S.sectionTitle}>My Support Tickets</div>
              <div style={{ ...S.sectionSub, marginBottom: 10 }}>
                Track your previous requests and continue conversations with support.
              </div>

              {loading ? (
                <div style={S.center}>
                  <div className="cs-spinner" />
                </div>
              ) : tickets.length === 0 ? (
                <div style={S.emptyCard}>
                  <div style={S.emptyIcon}>
                    <MessageSquare size={24} style={{ color: "#5B7384" }} />
                  </div>

                  <div style={S.emptyTitle}>No tickets yet</div>

                  <div style={S.emptySub}>
                    You have not submitted any support requests yet. Create your first
                    ticket if you need help from the team.
                  </div>

                  <button
                    style={S.newTicketBtn}
                    onClick={() => openNewTicket()}
                    type="button"
                  >
                    <Plus size={12} /> Submit Your First Ticket
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {tickets.map((t) => (
                    <TicketRow key={t._id} ticket={t} onClick={() => openTicket(t)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const TicketRow = ({ ticket, onClick }) => {
  const cat = CATEGORIES.find((c) => c.key === ticket.category) || CATEGORIES[5];
  const replyCount = (ticket.replies || []).length;
  const hasUnread =
    replyCount > 0 && (ticket.replies || []).some((r) => r.sender_role !== "student");

  return (
    <div
      style={{ ...S.ticketRow, ...(hasUnread ? S.ticketRowUnread : {}) }}
      onClick={onClick}
      className="cs-ticket-row"
    >
      <div style={{ ...S.ticketDot, background: cat.color }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexWrap: "wrap",
            marginBottom: 5,
          }}
        >
          <div style={S.ticketSubject}>{ticket.subject}</div>
          {hasUnread && <span style={S.newReplyBadge}>New reply</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <StatusPill status={ticket.status} />
          <PriorityPill priority={ticket.priority} />
          <CategoryPill category={ticket.category} />
          <span style={S.ticketMeta}>
            <Clock size={9} />
            {new Date(ticket.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {replyCount > 0 && (
            <span style={S.ticketMeta}>
              <MessageSquare size={9} />
              {replyCount} repl{replyCount !== 1 ? "ies" : "y"}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={15} style={{ color: "rgba(11,18,32,0.35)", flexShrink: 0 }} />
    </div>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    open: {
      color: "#2EABFE",
      bg: "rgba(46,171,254,0.10)",
      border: "rgba(46,171,254,0.25)",
      label: "Open",
    },
    in_progress: {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.28)",
      label: "In Progress",
    },
    resolved: {
      color: "#008000",
      bg: "rgba(0,128,0,0.10)",
      border: "rgba(0,128,0,0.22)",
      label: "Resolved",
    },
    closed: {
      color: "#5B7384",
      bg: "rgba(91,115,132,0.10)",
      border: "rgba(91,115,132,0.22)",
      label: "Closed",
    },
  };

  const s = map[status] || map.open;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 9,
        fontWeight: 900,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
};

const PriorityPill = ({ priority }) => {
  const map = {
    low: "#5B7384",
    normal: "#2EABFE",
    high: "#F59E0B",
    urgent: "#EF4444",
  };

  const color = map[priority] || "#2EABFE";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: 999,
        fontSize: 9,
        fontWeight: 800,
        color,
        background: `${color}12`,
        border: `1px solid ${color}30`,
      }}
    >
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
};

const CategoryPill = ({ category }) => {
  const cat = CATEGORIES.find((c) => c.key === category) || CATEGORIES[5];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 9,
        fontWeight: 800,
        color: cat.color,
        background: `${cat.color}10`,
        border: `1px solid ${cat.color}25`,
      }}
    >
      {cat.label}
    </span>
  );
};

const css = `
.cs-spinner{width:32px;height:32px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:csspin 1s linear infinite;}
@keyframes csspin{to{transform:rotate(360deg);}}
.cs-spin-sm{display:inline-block;width:12px;height:12px;border-radius:999px;border:2px solid rgba(255,255,255,0.30);border-top-color:#fff;animation:csspin 0.8s linear infinite;}
.cs-ticket-row{cursor:pointer;transition:box-shadow .15s,transform .15s;}
.cs-ticket-row:hover{box-shadow:0 5px 16px rgba(2,8,23,0.10);transform:translateY(-1px);}
.cs-topic-card{transition:box-shadow .15s,transform .15s,border-color .15s,background .15s;}
.cs-topic-card:hover{box-shadow:0 8px 18px rgba(2,8,23,0.10);transform:translateY(-1px);}
.cs-faq-item-btn{transition:background .15s;}
.cs-faq-item-btn:hover{background:rgba(2,8,23,0.02);}
textarea{resize:vertical;}
input::placeholder, textarea::placeholder{color:rgba(11,18,32,0.38);}
`;

const S = {
  wrap: { padding: "20px 24px 48px" },
  center: { minHeight: 180, display: "grid", placeItems: "center" },

  pageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(46,171,254,0.10)",
    border: "1px solid rgba(46,171,254,0.22)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#091925",
    letterSpacing: "-0.2px",
    fontFamily: "'Poppins',sans-serif",
  },
  pageSub: {
    fontSize: 11,
    fontWeight: 600,
    color: "#5B7384",
    marginTop: 2,
    fontFamily: "'Poppins',sans-serif",
  },
  openBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 11px",
    borderRadius: 999,
    background: "rgba(245,158,11,0.10)",
    border: "1px solid rgba(245,158,11,0.30)",
    color: "rgba(146,84,0,1)",
    fontSize: 11,
    fontWeight: 800,
    marginLeft: "auto",
    fontFamily: "'Poppins',sans-serif",
  },
  newTicketBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 9,
    border: "none",
    background: "#091925",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Poppins',sans-serif",
  },
  backLinkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 12px",
    borderRadius: 9,
    border: "1px solid rgba(2,8,23,0.12)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    color: "rgba(11,18,32,0.65)",
    fontFamily: "'Poppins',sans-serif",
    marginLeft: "auto",
  },
  headDivider: {
    height: "1.5px",
    background: "linear-gradient(90deg,#2EABFE,transparent)",
    borderRadius: 99,
    margin: "10px 0 18px",
  },

  helpHero: {
    background: "#fff",
    borderRadius: 14,
    border: "0.5px solid rgba(2,8,23,0.08)",
    boxShadow: "0 3px 14px rgba(2,8,23,0.06)",
    padding: 18,
    marginBottom: 18,
  },
  helpHeroTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  helpHeroHint: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(46,171,254,0.08)",
    border: "1px solid rgba(46,171,254,0.18)",
    color: "#2EABFE",
    fontSize: 10,
    fontWeight: 800,
    fontFamily: "'Poppins',sans-serif",
  },
  sectionBlock: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#091925",
    marginBottom: 6,
    fontFamily: "'Poppins',sans-serif",
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(11,18,32,0.48)",
    lineHeight: 1.55,
    fontFamily: "'Poppins',sans-serif",
  },

  searchWrap: {
    position: "relative",
    marginBottom: 12,
  },
  searchIcon: {
    position: "absolute",
    top: "50%",
    left: 12,
    transform: "translateY(-50%)",
    color: "rgba(11,18,32,0.35)",
  },
  searchInput: {
    width: "100%",
    height: 42,
    borderRadius: 10,
    border: "1px solid rgba(2,8,23,0.12)",
    padding: "0 14px 0 38px",
    background: "#fff",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(11,18,32,0.80)",
    outline: "none",
    fontFamily: "'Poppins',sans-serif",
  },
  quickFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  quickFilterBtn: {
    padding: "7px 11px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    color: "rgba(11,18,32,0.65)",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Poppins',sans-serif",
  },
  quickFilterBtnActive: {
    background: "rgba(46,171,254,0.10)",
    color: "#2EABFE",
    border: "1px solid rgba(46,171,254,0.28)",
  },

  topicGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 10,
  },
  topicCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 7,
    padding: "15px 12px",
    borderRadius: 12,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "'Poppins',sans-serif",
  },
  topicIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
  },
  topicLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(11,18,32,0.78)",
    textAlign: "center",
    fontFamily: "'Poppins',sans-serif",
  },
  topicMeta: {
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(11,18,32,0.45)",
    fontFamily: "'Poppins',sans-serif",
  },

  faqHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  clearFilterBtn: {
    padding: "7px 11px",
    borderRadius: 8,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    color: "rgba(11,18,32,0.65)",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Poppins',sans-serif",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  faqItem: {
    borderRadius: 12,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "#fff",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(2,8,23,0.04)",
  },
  faqItemBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "15px 16px",
    border: "none",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: 800,
    color: "#091925",
    lineHeight: 1.5,
    fontFamily: "'Poppins',sans-serif",
  },
  faqItemMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
    flexWrap: "wrap",
  },
  faqChevron: {
    color: "rgba(11,18,32,0.38)",
    transition: "transform .18s ease",
    flexShrink: 0,
  },
  faqAnswerWrap: {
    padding: "0 16px 15px 16px",
    borderTop: "1px solid rgba(2,8,23,0.06)",
    background: "rgba(2,8,23,0.015)",
  },
  faqAnswer: {
    paddingTop: 12,
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(11,18,32,0.75)",
    lineHeight: 1.7,
    fontFamily: "'Poppins',sans-serif",
  },
  faqActions: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  linkBtn: {
    display: "inline-flex",
    alignItems: "center",
    border: "none",
    background: "transparent",
    color: "#2EABFE",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 800,
    padding: 0,
    fontFamily: "'Poppins',sans-serif",
  },
  faqEmpty: {
    borderRadius: 13,
    border: "1px dashed rgba(2,8,23,0.13)",
    background: "rgba(2,8,23,0.02)",
    padding: "34px 18px",
    textAlign: "center",
  },

  ticketCtaCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
    padding: "18px 18px",
    borderRadius: 14,
    background: "linear-gradient(180deg,#ffffff,rgba(46,171,254,0.04))",
    border: "1px solid rgba(46,171,254,0.16)",
    boxShadow: "0 4px 14px rgba(46,171,254,0.08)",
  },
  ticketCtaTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#091925",
    marginBottom: 4,
    fontFamily: "'Poppins',sans-serif",
  },
  ticketCtaText: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(11,18,32,0.55)",
    lineHeight: 1.6,
    maxWidth: 520,
    fontFamily: "'Poppins',sans-serif",
  },

  card: {
    background: "#fff",
    borderRadius: 13,
    border: "0.5px solid rgba(2,8,23,0.08)",
    boxShadow: "0 3px 14px rgba(2,8,23,0.07)",
    padding: 20,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#091925",
    fontFamily: "'Poppins',sans-serif",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "rgba(2,8,23,0.03)",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "rgba(11,18,32,0.55)",
  },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(11,18,32,0.60)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
    display: "block",
    fontFamily: "'Poppins',sans-serif",
  },
  charCount: {
    fontSize: 10,
    color: "rgba(11,18,32,0.40)",
    textAlign: "right",
    marginTop: 3,
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 7,
  },
  categoryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 10px",
    borderRadius: 9,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "rgba(2,8,23,0.02)",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(11,18,32,0.65)",
    fontFamily: "'Poppins',sans-serif",
  },
  priorityBtn: {
    padding: "6px 13px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.12)",
    background: "#fff",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(11,18,32,0.65)",
    fontFamily: "'Poppins',sans-serif",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 9,
    border: "1px solid rgba(2,8,23,0.14)",
    background: "#fff",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(11,18,32,0.85)",
    outline: "none",
    fontFamily: "'Poppins',sans-serif",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 9,
    border: "1px solid rgba(2,8,23,0.14)",
    background: "#fff",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(11,18,32,0.85)",
    outline: "none",
    fontFamily: "'Poppins',sans-serif",
    lineHeight: 1.6,
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 9,
    marginTop: 18,
    paddingTop: 16,
    borderTop: "0.5px solid rgba(2,8,23,0.07)",
  },
  cancelBtn: {
    padding: "9px 16px",
    borderRadius: 9,
    border: "1px solid rgba(2,8,23,0.12)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    color: "rgba(11,18,32,0.65)",
    fontFamily: "'Poppins',sans-serif",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 18px",
    borderRadius: 9,
    border: "none",
    background: "#091925",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Poppins',sans-serif",
  },

  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 13px",
    borderRadius: 9,
    background: "rgba(0,128,0,0.08)",
    border: "1px solid rgba(0,128,0,0.22)",
    color: "rgba(0,100,0,1)",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    fontFamily: "'Poppins',sans-serif",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 13px",
    borderRadius: 9,
    background: "rgba(239,68,68,0.07)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "rgba(185,28,28,1)",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    fontFamily: "'Poppins',sans-serif",
  },

  detailMeta: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: "0.5px solid rgba(2,8,23,0.07)",
  },
  detailSubject: {
    fontSize: 16,
    fontWeight: 800,
    color: "#091925",
    letterSpacing: "-0.2px",
    fontFamily: "'Poppins',sans-serif",
  },
  detailDate: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(11,18,32,0.45)",
  },

  msgBlock: {
    display: "flex",
    gap: 11,
    padding: "13px",
    borderRadius: 11,
    border: "0.5px solid rgba(2,8,23,0.07)",
    background: "rgba(2,8,23,0.015)",
  },
  msgBlockSupport: {
    background: "rgba(46,171,254,0.04)",
    border: "1px solid rgba(46,171,254,0.15)",
  },
  msgAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#091925,#054040)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00B4B4",
    fontWeight: 900,
    fontSize: 14,
    flexShrink: 0,
  },
  avatarSupport: {
    background: "rgba(46,171,254,0.15)",
    color: "#2EABFE",
  },
  msgSender: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 700,
    fontSize: 12,
    color: "#091925",
    marginBottom: 2,
    fontFamily: "'Poppins',sans-serif",
  },
  msgRole: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 800,
    color: "rgba(11,18,32,0.55)",
    background: "rgba(2,8,23,0.06)",
    border: "1px solid rgba(2,8,23,0.10)",
  },
  msgDate: {
    fontSize: 10,
    color: "rgba(11,18,32,0.45)",
    fontWeight: 600,
    marginBottom: 6,
  },
  msgText: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(11,18,32,0.80)",
    lineHeight: 1.65,
    fontFamily: "'Poppins',sans-serif",
  },

  replyBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "0.5px solid rgba(2,8,23,0.07)",
  },
  replyLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(11,18,32,0.50)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
    fontFamily: "'Poppins',sans-serif",
  },
  closedNote: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: "11px 13px",
    borderRadius: 9,
    background: "rgba(0,128,0,0.07)",
    border: "1px solid rgba(0,128,0,0.20)",
    color: "rgba(0,100,0,1)",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Poppins',sans-serif",
  },

  ticketRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 15px",
    borderRadius: 11,
    border: "0.5px solid rgba(2,8,23,0.08)",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(2,8,23,0.05)",
  },
  ticketRowUnread: {
    borderColor: "rgba(46,171,254,0.35)",
    boxShadow: "0 2px 10px rgba(46,171,254,0.12)",
  },
  ticketDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  ticketSubject: {
    fontWeight: 700,
    fontSize: 13,
    color: "#091925",
    fontFamily: "'Poppins',sans-serif",
  },
  ticketMeta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(11,18,32,0.45)",
  },
  newReplyBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 900,
    color: "#2EABFE",
    background: "rgba(46,171,254,0.10)",
    border: "1px solid rgba(46,171,254,0.25)",
  },

  emptyCard: {
    borderRadius: 13,
    border: "1px dashed rgba(2,8,23,0.13)",
    background: "rgba(2,8,23,0.02)",
    padding: "38px 18px",
    textAlign: "center",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "rgba(91,115,132,0.10)",
    border: "1px solid rgba(91,115,132,0.20)",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 12px",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "rgba(11,18,32,0.75)",
    marginBottom: 6,
    fontFamily: "'Poppins',sans-serif",
  },
  emptySub: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(11,18,32,0.50)",
    lineHeight: 1.6,
    maxWidth: 420,
    margin: "0 auto 16px",
    fontFamily: "'Poppins',sans-serif",
  },
};

export default ContactSupport;