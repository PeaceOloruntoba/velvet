"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

type StepState = {
  step: number;
  name: string;
  heartRate: number;
  quizAnswer: string | null;
  truthAnswer: string | null;
  coupons: string[];
  favorites: string[];
  foreverAnswer: string | null;
  surpriseAnswer: string | null;
  comment: string;
  submitted: boolean;
};

const STORAGE_KEY = "girlfriends-day-velvet-state";

const initialState: StepState = {
  step: 1,
  name: "",
  heartRate: 0,
  quizAnswer: null,
  truthAnswer: null,
  coupons: [],
  favorites: [],
  foreverAnswer: null,
  surpriseAnswer: null,
  comment: "",
  submitted: false,
};

const couponOptions = [
  "Unlimited Hugs",
  "Midnight Ice Cream Run",
  "Winning Any Argument",
  "Princess Treatment All Day",
  "Romantic Dinner Date",
];

const favoriteOptions = [
  "Your smile 😊",
  "Your warm hugs 🫂",
  "Your touch 🔥",
  "You existing 💕",
];

const heartParticles = Array.from({ length: 14 }, (_, index) => index);

export default function Home() {
  const [state, setState] = useState<StepState>(initialState);
  const [noButtonOffset, setNoButtonOffset] = useState({ x: 0, y: 0 });
  const [noButtonOffsetTwo, setNoButtonOffsetTwo] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<StepState>;
      setState({ ...initialState, ...parsed, step: parsed.step ?? 1 });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.step !== 2 || state.heartRate < 100) return;
    const timeout = window.setTimeout(() => {
      setState((prev) => ({ ...prev, step: 3 }));
      toast.success("Maximum Love Capacity unlocked 💖");
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [state.step, state.heartRate]);

  const progressValue = useMemo(() => {
    const completedSteps = [state.name, state.quizAnswer, state.truthAnswer, state.coupons.length >= 3, state.favorites.length === 4, state.foreverAnswer, state.surpriseAnswer, state.comment].filter(Boolean).length;
    return Math.round((completedSteps / 8) * 100);
  }, [state]);

  const updateStep = (nextStep: number) => {
    setState((prev) => ({ ...prev, step: nextStep }));
  };

  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = state.name.trim();
    if (trimmed.toLowerCase() === "folashade") {
      updateStep(2);
      toast.success("You found the right path, my love ✨");
      return;
    }

    toast.error(`Hmm... I don't know you! The name of my gorgeous girlfriend is not "${trimmed || "that"}"!`);
  };

  const handleQuizAnswer = (answer: string) => {
    if (answer !== "You did 🙈") {
      toast.error("Nice try, my love! But you know I fell head over heels for you long before you even noticed me 😜 Try again!");
      return;
    }

    setState((prev) => ({ ...prev, quizAnswer: answer }));
    toast.success("Exactly, my love. You remembered me perfectly 💘");
    updateStep(4);
  };

  const handleTruthAnswer = (answer: "yes" | "no") => {
    if (answer === "yes") {
      setState((prev) => ({ ...prev, truthAnswer: "Yes 🥹" }));
      toast.success("That is the sweetest truth I could hear 🫶");
      updateStep(5);
      return;
    }

    toast.error("Wrong input! Please click Yes to proceed 💖");
    setNoButtonOffset({ x: Math.random() * 140 - 70, y: Math.random() * 90 - 45 });
  };

  const toggleCoupon = (coupon: string) => {
    setState((prev) => {
      const alreadySelected = prev.coupons.includes(coupon);
      if (alreadySelected) {
        return { ...prev, coupons: prev.coupons.filter((item) => item !== coupon) };
      }

      if (prev.coupons.length >= 3) {
        toast.message("You already picked your three coupons for the week 💌");
        return prev;
      }

      return { ...prev, coupons: [...prev.coupons, coupon] };
    });
  };

  const toggleFavorite = (item: string) => {
    setState((prev) => {
      const exists = prev.favorites.includes(item);
      const nextFavorites = exists ? prev.favorites.filter((entry) => entry !== item) : [...prev.favorites, item];
      if (!exists) {
        const audioContext = typeof window !== "undefined" ? new window.AudioContext() : null;
        if (audioContext) {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.type = "sine";
          oscillator.frequency.value = 880;
          gain.gain.value = 0.08;
          oscillator.start();
          gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
          oscillator.stop(audioContext.currentTime + 0.2);
          void audioContext.close();
        }
      }
      return { ...prev, favorites: nextFavorites };
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      name: state.name,
      heartRate: state.heartRate,
      quizAnswer: state.quizAnswer,
      truthAnswer: state.truthAnswer,
      coupons: state.coupons,
      favorites: state.favorites,
      foreverAnswer: state.foreverAnswer,
      surpriseAnswer: state.surpriseAnswer,
      comment: state.comment,
    };

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Your message is on its way to my heart 💌");
    } catch {
      toast.error("The message still found a way to reach me, even if the network was shy 🌙");
    } finally {
      setIsSubmitting(false);
      setState((prev) => ({ ...prev, step: 10, submitted: true }));
    }
  };

  const handleReplay = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setNoButtonOffset({ x: 0, y: 0 });
    setNoButtonOffsetTwo({ x: 0, y: 0 });
    toast.success("The romance begins again 💖");
  };

  const handleForeverNo = () => {
    setNoButtonOffsetTwo({ x: Math.random() * 120 - 60, y: Math.random() * 90 - 45 });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_45%),linear-gradient(135deg,_#f472b6_0%,_#fb7185_35%,_#f43f5e_100%)] px-3 py-4 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        {heartParticles.map((particle) => (
          <motion.span
            key={particle}
            className="pointer-events-none absolute left-1/2 top-1/2 text-2xl text-white/60"
            animate={{
              x: [0, (particle % 3) * 140 - 140, 0],
              y: [0, (particle % 5) * 90 - 180, 0],
              opacity: [0.3, 0.9, 0.2],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{ duration: 6 + (particle % 5), repeat: Infinity, ease: "easeInOut" }}
          >
            ♥
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col rounded-[1.5rem] border border-white/30 bg-white/20 p-3 shadow-[0_25px_80px_rgba(190,24,93,0.25)] backdrop-blur-xl sm:min-h-[calc(100vh-4rem)] sm:rounded-[2rem] sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-white/40 bg-white/30 px-3 py-3 text-sm font-medium text-slate-800 shadow-sm backdrop-blur-md sm:mb-6 sm:rounded-full sm:px-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-rose-700/80">Girlfriend&apos;s Day</p>
            <p className="text-base font-semibold sm:text-lg">A love letter for my favorite girl</p>
          </div>
          <div className="rounded-full bg-rose-500/20 px-3 py-1 text-rose-700">
            Step {state.step} of 10
          </div>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/35 sm:mb-6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500"
            animate={{ width: `${progressValue}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {state.step === 1 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 1</p>
                  <h1 className="text-2xl font-semibold text-slate-900 sm:text-4xl">What is your name, my love?</h1>
                  <p className="max-w-2xl text-base text-slate-700 sm:text-lg">Tell me who you are so I can welcome you into my heart.</p>
                </div>
                <form onSubmit={handleNameSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <input
                    value={state.name}
                    onChange={(event) => setState((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Type your name here"
                    className="flex-1 rounded-full border border-white/40 bg-white/70 px-4 py-3 text-base outline-none ring-0 placeholder:text-slate-500 sm:text-lg"
                  />
                  <button className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]">
                    Submit
                  </button>
                </form>
              </div>
            )}

            {state.step === 2 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 2</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Checking heart rate synchronization...</h2>
                  <p className="text-base text-slate-700 sm:text-lg">Drag the meter to 100% to unlock the sweetest connection.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Current sync</span>
                    <span className="font-semibold text-rose-600">{state.heartRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.heartRate}
                    onChange={(event) => setState((prev) => ({ ...prev, heartRate: Number(event.target.value) }))}
                    className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/70 accent-rose-500"
                  />
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-4xl sm:text-5xl"
                    >
                      💗
                    </motion.div>
                    <div className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-800">
                      {state.heartRate === 100 ? "Maximum Love Capacity" : "We’re almost there..."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.step === 3 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 3</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Do you remember who fell in love first?</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "You did 🙈",
                    "I did 💖",
                    "We fell at the exact same second ✨",
                  ].map((answer) => (
                    <button
                      key={answer}
                      onClick={() => handleQuizAnswer(answer)}
                      className="rounded-2xl border border-white/40 bg-white/70 px-4 py-4 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:scale-[1.01] sm:text-base"
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state.step === 4 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 4</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Be honest... Do you love me more than yourself?</h2>
                </div>
                <div className="relative flex min-h-[180px] flex-col justify-center gap-4 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleTruthAnswer("yes")}
                    className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg"
                  >
                    Yes 🥹
                  </motion.button>
                  <motion.button
                    animate={{ x: noButtonOffset.x, y: noButtonOffset.y }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    onMouseEnter={() => setNoButtonOffset({ x: Math.random() * 140 - 70, y: Math.random() * 90 - 45 })}
                    onTouchStart={() => setNoButtonOffset({ x: Math.random() * 140 - 70, y: Math.random() * 90 - 45 })}
                    onClick={() => handleTruthAnswer("no")}
                    className="rounded-full border border-rose-300 bg-white/80 px-7 py-3 text-base font-semibold text-rose-700 shadow-md sm:px-8 sm:py-4 sm:text-lg"
                  >
                    No 😜
                  </motion.button>
                </div>
              </div>
            )}

            {state.step === 5 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 5</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Pick 3 coupons to claim for this week:</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {couponOptions.map((coupon) => {
                    const selected = state.coupons.includes(coupon);
                    return (
                      <button
                        key={coupon}
                        onClick={() => toggleCoupon(coupon)}
                        className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition sm:text-base ${selected ? "border-rose-400 bg-rose-500/20 text-rose-800 shadow-md" : "border-white/40 bg-white/70 text-slate-800"}`}
                      >
                        {coupon}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between rounded-full bg-white/50 px-4 py-3 text-sm text-slate-700">
                  <span>{state.coupons.length}/3 selected</span>
                  <button
                    disabled={state.coupons.length !== 3}
                    onClick={() => updateStep(6)}
                    className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {state.step === 6 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 6</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Click all the things that make my world brighter:</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {favoriteOptions.map((item) => {
                    const selected = state.favorites.includes(item);
                    return (
                      <motion.button
                        key={item}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleFavorite(item)}
                        className={`rounded-2xl border px-4 py-4 text-left text-base font-medium transition sm:px-5 sm:py-5 sm:text-lg ${selected ? "border-rose-400 bg-rose-500/20 text-rose-800 shadow-md" : "border-white/40 bg-white/70 text-slate-800"}`}
                      >
                        {item}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between rounded-full bg-white/50 px-4 py-3 text-sm text-slate-700">
                  <span>{state.favorites.length}/4 selected</span>
                  <button
                    disabled={state.favorites.length !== 4}
                    onClick={() => updateStep(7)}
                    className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {state.step === 7 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 7</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Would you love me forever and ever?</h2>
                </div>
                <div className="relative flex min-h-[180px] flex-col justify-center gap-4 sm:flex-row">
                  <button
                    onClick={() => {
                      setState((prev) => ({ ...prev, foreverAnswer: "Yes, forever! 💍" }));
                      updateStep(8);
                      toast.success("Forever sounds perfect 💍");
                    }}
                    className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg"
                  >
                    Yes, forever! 💍
                  </button>
                  <motion.button
                    animate={{ x: noButtonOffsetTwo.x, y: noButtonOffsetTwo.y }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    onMouseEnter={handleForeverNo}
                    onTouchStart={handleForeverNo}
                    disabled
                    className="rounded-full border border-rose-300 bg-white/80 px-7 py-3 text-base font-semibold text-rose-700 shadow-md disabled:cursor-not-allowed sm:px-8 sm:py-4 sm:text-lg"
                  >
                    No
                  </motion.button>
                </div>
              </div>
            )}

            {state.step === 8 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 8</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Would you like a special date or surprise like this again soon?</h2>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  {[
                    "Yes please! ✨",
                    "Definitely Yes! 💕",
                  ].map((answer) => (
                    <button
                      key={answer}
                      onClick={() => {
                        setState((prev) => ({ ...prev, surpriseAnswer: answer }));
                        updateStep(9);
                      }}
                      className="rounded-full bg-white/80 px-7 py-3 text-base font-semibold text-rose-700 shadow-md sm:px-8 sm:py-4 sm:text-lg"
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state.step === 9 && (
              <div className="flex h-full flex-col justify-center gap-6 rounded-[1.5rem] border border-white/30 bg-white/20 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-rose-700/80">Step 9</p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-4xl">Leave a sweet message or tell me what you think about this site!</h2>
                </div>
                <textarea
                  value={state.comment}
                  onChange={(event) => setState((prev) => ({ ...prev, comment: event.target.value }))}
                  rows={6}
                  placeholder="Your words make my whole heart glow..."
                  className="rounded-[1.25rem] border border-white/40 bg-white/70 p-4 text-base outline-none min-h-[140px]"
                />
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70 sm:px-8"
                >
                  {isSubmitting ? "Sending your love..." : "Send my heart"}
                </button>
              </div>
            )}

            {state.step === 10 && (
              <div className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden rounded-[1.25rem] border border-white/30 bg-gradient-to-br from-pink-500/20 via-rose-300/20 to-fuchsia-600/20 p-4 shadow-2xl backdrop-blur-md sm:rounded-[1.5rem] sm:p-10">
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/40 blur-3xl" />
                </motion.div>
                <div className="relative z-10 space-y-6 text-center">
                  <motion.div animate={{ y: [0, -8, 0], rotate: [0, 8, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity }} className="mx-auto text-7xl">
                    💖
                  </motion.div>
                  <div className="rounded-[1.25rem] border border-white/40 bg-white/70 p-4 shadow-xl backdrop-blur-md sm:rounded-[1.75rem] sm:p-6">
                    <p className="mb-4 text-sm uppercase tracking-[0.35em] text-rose-700/80">Forever in bloom</p>
                    <blockquote className="space-y-3 text-base leading-7 text-slate-800 sm:text-lg sm:leading-8">
                      <p>“You are the rhythm in my pulse, the fire under my skin,</p>
                      <p>The gentle spark where every wild desire begins.</p>
                      <p>In your eyes, I lose the world; in your touch, I lose control,</p>
                      <p>You hold the fever in my veins and the secret to my soul.</p>
                      <p>Every breath of yours is music, every whisper sets me free,</p>
                      <p>There is no boundary, my love, between your heart and me.</p>
                      <p>Forever yours, in softest light and deepest, darkest heat—</p>
                      <p>My soul belongs to you alone, with every rhythm and beat.”</p>
                    </blockquote>
                  </div>
                  <button
                    onClick={handleReplay}
                    className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] sm:px-6"
                  >
                    Replay Experience
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <Toaster richColors position="top-right" />
    </main>
  );
}
