// src/pages/public/Landing.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Upload, Share2, DollarSign, Shield, BarChart3,
  Zap, Users, ChevronDown, ArrowRight, CheckCircle,
  Video, Globe, Lock, Send, Copy, CheckCheck
} from "lucide-react";
import { ROUTES } from "../../constants/routes";

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative text-center max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/60 mb-8">
          <Zap size={14} className="text-cyan-400" />
          Powered by Cloudflare R2 · Real-time earnings
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Turn Telegram &amp; Cloud Videos{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Into Earnings
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload videos or send links to our Telegram bot. Get personal share links, monetize views, and withdraw earnings — all in one platform.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={ROUTES.REGISTER}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition shadow-lg shadow-cyan-500/25"
          >
            Start Earning <ArrowRight size={18} />
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            Creator Login
          </Link>
          <a
            href="https://t.me/clipnova_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-[#229ED9]/20 border border-[#229ED9]/30 hover:bg-[#229ED9]/30 transition"
          >
            <Send size={18} /> Open Telegram Bot
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-16 flex items-center justify-center gap-8 text-sm text-white/30">
          {["No setup fees", "Instant payouts", "Fraud protection"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" /> {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── FEATURES ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Lock, title: "Secure Video Hosting", desc: "Videos stored on Cloudflare R2 with signed URLs. No unauthorized access.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Real-time view tracking, earnings breakdown, and performance insights.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Shield, title: "Fraud Protection", desc: "AI-powered bot detection. Only genuine views count toward earnings.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Zap, title: "Instant Withdrawals", desc: "Request payouts via UPI, Bank Transfer, or PayPal. Processed fast.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: Users, title: "Referral Earnings", desc: "Invite creators and earn a commission on their validated views.", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: Globe, title: "Cloudflare R2 Powered", desc: "Global CDN delivery. Your videos load fast everywhere in the world.", color: "text-orange-400", bg: "bg-orange-500/10" },
];

function Features() {
  return (
    <section className="py-24 px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Monetize</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">A complete platform built for serious video creators.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/8 transition group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={22} className={f.color} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", icon: Upload, title: "Upload Video", desc: "Upload your video directly to our secure Cloudflare R2 storage." },
  { num: "02", icon: Share2, title: "Share Link", desc: "Get a unique shareable link for your video. Share anywhere." },
  { num: "03", icon: Play, title: "Get Views", desc: "Viewers watch your video. Our system validates each genuine view." },
  { num: "04", icon: DollarSign, title: "Earn Money", desc: "Earnings credited to your wallet instantly after view validation." },
];

function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white/2">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-white/40 text-lg">Start earning in 4 simple steps.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} variants={fadeUp} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <s.icon size={24} className="text-cyan-400" />
              </div>
              <span className="text-xs font-mono text-white/20 mb-2 block">{s.num}</span>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "10K+", label: "Active Creators" },
  { value: "500K+", label: "Videos Hosted" },
  { value: "50M+", label: "Total Views" },
  { value: "₹2Cr+", label: "Payouts Processed" },
];

function Stats() {
  return (
    <section className="py-20 px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">{s.value}</p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── TELEGRAM POWER ───────────────────────────────────────────────────────────
const BOT_COMMANDS = [
  { cmd: "/login", desc: "Link your account" },
  { cmd: "/videos", desc: "List your videos" },
  { cmd: "/wallet", desc: "Check balance" },
  { cmd: "/stats", desc: "View performance" },
];

function TelegramSection() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText("@clipnova_bot");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section className="py-24 px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-full px-4 py-2 text-sm text-[#229ED9] mb-6">
            <Send size={14} /> Telegram Powered
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Upload Directly From Telegram</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Send videos, paste links, bulk import — all from your Telegram app.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div variants={fadeUp} className="space-y-4">
            {[
              { icon: Upload, title: "Send Videos Directly", desc: "Forward any video to the bot. Auto-uploaded to R2 storage." },
              { icon: Share2, title: "Instant Share Links", desc: "Get your personal monetized link immediately after upload." },
              { icon: Zap, title: "Bulk Import", desc: "Forward 100 videos at once. All queued and processed automatically." },
              { icon: Globe, title: "Import from Anywhere", desc: "TeraBox, Dailymotion, Streamtape, MP4 links — all supported." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="bg-[#229ED9]/10 p-2.5 rounded-lg shrink-0">
                  <f.icon size={18} className="text-[#229ED9]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#229ED9] rounded-full flex items-center justify-center">
                  <Send size={14} className="text-white" />
                </div>
                <span className="font-semibold">@clipnova_bot</span>
              </div>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/10">
                {copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="space-y-2">
              {BOT_COMMANDS.map((c) => (
                <div key={c.cmd} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <code className="text-cyan-400 font-mono text-sm font-semibold">{c.cmd}</code>
                  <span className="text-white/40 text-xs">{c.desc}</span>
                </div>
              ))}
            </div>

            <a
              href="https://t.me/clipnova_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm bg-[#229ED9] hover:bg-[#1a8bc4] text-white transition"
            >
              <Send size={16} /> Open Bot in Telegram
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "How do I start earning?", a: "Register, upload a video or send a link to our Telegram bot, share the link. You earn for every validated view." },
  { q: "How do Telegram uploads work?", a: "Send any video or supported link to @clipnova_bot. The bot auto-imports it, generates your personal share link, and earnings start immediately." },
  { q: "What is the max upload size?", a: "Web uploads support up to 1 GB. Telegram Bot API has a 20 MB limit. For larger files, use TeraBox or direct MP4 links via the bot." },
  { q: "What counts as a valid view?", a: "A view is valid when a real user watches your video for the minimum required duration (5 seconds). Bot traffic is automatically rejected." },
  { q: "When can I withdraw?", a: "You can request a withdrawal once your available balance reaches ₹100. Payouts are processed within 3-5 business days." },
  { q: "What links are supported for import?", a: "TeraBox, Dailymotion, Streamtape, Mixdrop, DoodStream, direct MP4 URLs, and ClipNova reshare links are all supported." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-3xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-white">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-white/40 transition-transform shrink-0 ml-4 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-white/50 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-white/10 rounded-3xl p-12"
      >
        <Video size={40} className="text-cyan-400 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Earning?</h2>
        <p className="text-white/50 mb-8">Join thousands of creators monetizing their content on NovaX.</p>
        <Link
          to={ROUTES.REGISTER}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition shadow-lg shadow-cyan-500/25"
        >
          Create Free Account <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xl font-bold text-white">NovaX</p>
          <p className="text-white/30 text-sm mt-1">© 2026 NovaX. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-white/40">
          <Link to={ROUTES.LOGIN} className="hover:text-white transition">Login</Link>
          <Link to={ROUTES.REGISTER} className="hover:text-white transition">Register</Link>
          <a href="https://t.me/clipnova_bot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram Bot</a>
          <a href="mailto:support@novax.app" className="hover:text-white transition">Support</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={ROUTES.LANDING} className="text-xl font-bold text-white">NovaX</Link>
        <div className="flex items-center gap-3">
          <Link to={ROUTES.LOGIN} className="text-sm text-white/60 hover:text-white transition px-4 py-2">Login</Link>
          <Link to={ROUTES.REGISTER} className="text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-xl hover:opacity-90 transition">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <TelegramSection />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
