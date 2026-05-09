// src/pages/creator/Support.jsx
import { MessageCircle, Mail, ExternalLink } from "lucide-react";

const SUPPORT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "Telegram Support",
    description: "Get help from our support team on Telegram",
    action: "Open Telegram",
    href: "https://t.me/novaxsupport",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email and we'll respond within 24 hours",
    action: "Send Email",
    href: "mailto:support@novax.app",
    color: "bg-purple-500/20 text-purple-400",
  },
];

const FAQS = [
  {
    q: "When do I get paid?",
    a: "Earnings are credited to your wallet after views are validated. Withdrawals are processed within 3–5 business days.",
  },
  {
    q: "What is the minimum withdrawal amount?",
    a: "The minimum withdrawal amount is ₹100.",
  },
  {
    q: "Why are some views rejected?",
    a: "Views are validated to prevent fraud. Bot traffic, repeated views from the same IP, and very short watch times are rejected.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your referral link. When a new creator signs up and uploads videos, you earn a commission on their validated views.",
  },
];

export default function Support() {
  return (
    <div className="space-y-8 text-white max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-white/40 text-sm mt-1">We're here to help</p>
      </div>

      {/* Contact Channels */}
      <div className="space-y-4">
        {SUPPORT_CHANNELS.map(({ icon: Icon, title, description, action, href, color }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition group"
          >
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{title}</p>
              <p className="text-white/40 text-sm">{description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/40 group-hover:text-white transition shrink-0">
              {action} <ExternalLink size={14} />
            </div>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-white/5">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="px-6 py-4">
              <p className="font-medium text-sm">{q}</p>
              <p className="text-white/50 text-sm mt-1.5 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
