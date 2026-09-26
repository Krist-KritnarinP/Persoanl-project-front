import React, { useState } from "react";
import {
  FiArrowUpRight,
  FiArrowRight,
  FiMapPin,
  FiCalendar,
  FiSun,
  FiShare2,
  FiCheck,
  FiCompass,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { copy } from "./copy";

export default function LandingContent({
  lang = "th",
  onLanguage,
  signedIn = false,
}) {
  const c = copy[lang] || copy.th;
  const [day, setDay] = useState(0);
  const start = signedIn ? "/dashboard" : "/login";
  const startLabel = signedIn ? c.dashboard : c.start;
  const icons = [FiCalendar, FiMapPin, FiCompass, FiSun, FiShare2];
  return (
    <div className="landing">
      <a className="lp-skip" href="#main">
        {c.skip}
      </a>
      <header className="lp-nav lp-wrap">
        <a href="/" className="lp-brand" aria-label="AI LHOUNG Home">
          <span className="lp-brand-icon">
            <FiCompass />
          </span>{" "}
          AI LHOUNG<span className="lp-brand-dot">✳</span>
        </a>
        <nav
          aria-label={lang === "th" ? "เมนูหลัก" : "Main navigation"}
          className="lp-nav-links"
        >
          <a href="#features">{c.nav[0]}</a>
          <a href="#sample">{c.nav[1]}</a>
          <a href="#how">{c.nav[2]}</a>
        </nav>
        <div className="lp-nav-end">
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => onLanguage?.(e.target.value)}
          >
            <option value="th">TH</option>
            <option value="en">EN</option>
            <option value="zh">中文</option>
            <option value="ko">한국어</option>
          </select>
          <a href={start} className="lp-login">
            {signedIn ? c.dashboard : c.login} <FiArrowUpRight />
          </a>
        </div>
      </header>
      <main id="main">
        <section className="lp-hero lp-wrap">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">
              <span />
              {c.eyebrow}
            </p>
            <h1>
              {c.hero[0]}
              <br />
              <em>{c.hero[1]}</em>
            </h1>
            <p className="lp-intro">{c.intro}</p>
            <div className="lp-actions">
              <a className="lp-button" href={start}>
                {startLabel}
                <FiArrowUpRight />
              </a>
              <a className="lp-text-link" href="#sample">
                {c.explore}
                <FiArrowRight />
              </a>
            </div>
            <p className="lp-quiet">
              <FiCheck />
              {c.note}
            </p>
          </div>
          <div className="lp-hero-art">
            <div className="lp-postcard">
              <img
                src="/landing-mountains.svg"
                width="640"
                height="680"
                alt=""
                fetchPriority="high"
              />
              <div className="lp-postcard-top">
                <span>YOUR NEXT CHAPTER</span>
                <FiArrowUpRight />
              </div>
              <div className="lp-postcard-caption">
                <span>18°47′ N · 98°59′ E</span>
                <strong>
                  Meet me
                  <br />
                  <i>in the mountains.</i>
                </strong>
                <span>CHIANG MAI, THAILAND</span>
              </div>
            </div>
            <div className="lp-weather-sticker">
              <FiSun />
              <div>
                <b>24°</b>
                <span>MOUNTAIN DAYDREAM</span>
              </div>
            </div>
            <div className="lp-plan-sticker">
              <span className="lp-tiny-icon">
                <FiMapPin />
              </span>
              <div>
                <b>{c.sampleTitle}</b>
                <span>
                  3 {c.days} · 9 {c.places}
                </span>
              </div>
              <span className="lp-check">
                <FiCheck />
              </span>
            </div>
            <span className="lp-art-note">
              a little plan.
              <br />a lot of possibilities.
            </span>
          </div>
        </section>
        <div className="lp-ribbon">
          <div className="lp-wrap">
            {c.ribbon.map((label, i) => (
              <span key={label}>
                <span className="lp-ribbon-number">0{i + 1}</span>
                {label}
                <span className="lp-spark">✳</span>
              </span>
            ))}
          </div>
        </div>
        <section id="features" className="lp-wrap lp-section">
          <div className="lp-section-heading">
            <div>
              <p className="lp-eyebrow">{c.featureEyebrow}</p>
              <h2>{c.featureTitle}</h2>
            </div>
            <p>{c.featureIntro}</p>
          </div>
          <div className="lp-feature-grid">
            {c.features.map(([title, desc], i) => {
              const Icon = icons[i];
              return (
                <article className={`lp-feature lp-feature-${i}`} key={title}>
                  <div className="lp-feature-top">
                    <Icon />
                    <span>0{i + 1}</span>
                  </div>
                  {i === 0 && (
                    <div className="lp-mini-days" aria-hidden="true">
                      <span>
                        DAY 01 <FiCheck />
                      </span>
                      <span>
                        DAY 02 <FiCheck />
                      </span>
                      <span>
                        DAY 03 <FiPlus />
                      </span>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="lp-mini-map" aria-hidden="true">
                      <svg viewBox="0 0 300 90">
                        <path
                          d="M20 70 Q80 5 140 55 T280 15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="6 6"
                        />
                        <circle cx="20" cy="70" r="7" fill="currentColor" />
                        <circle cx="140" cy="55" r="7" fill="currentColor" />
                        <circle cx="280" cy="15" r="7" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="lp-mini-budget" aria-hidden="true">
                      <span>THB</span>
                      <b>
                        4,500<span>.00</span>
                      </b>
                      <div>
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  )}
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  {i === 3 && <small>{c.aiNote}</small>}
                </article>
              );
            })}
          </div>
        </section>
        <section id="sample" className="lp-sample-section">
          <div className="lp-wrap lp-sample-layout">
            <div>
              <p className="lp-eyebrow">A PEEK AT YOUR NEXT GETAWAY</p>
              <h2>{c.sampleTitle}</h2>
              <p className="lp-sample-desc">{c.sampleDesc}</p>
              <div className="lp-sample-stats">
                <div>
                  <strong>3</strong>
                  <span>{c.days}</span>
                </div>
                <div>
                  <strong>9</strong>
                  <span>{c.places}</span>
                </div>
                <div>
                  <strong>4,500</strong>
                  <span>
                    {c.currency} · {c.budget}
                  </span>
                </div>
              </div>
              <a className="lp-text-link" href={start}>
                {startLabel}
                <FiArrowUpRight />
              </a>
              <p className="lp-sample-note">{c.sampleNote}</p>
            </div>
            <div className="lp-itinerary">
              <div className="lp-itinerary-head">
                <span>
                  <FiCalendar /> {c.sample}
                </span>
                <span className="lp-itinerary-dots" aria-hidden="true">
                  •••
                </span>
              </div>
              <div className="lp-day-tabs" role="group" aria-label={c.sample}>
                {c.dayNames.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={day === i}
                    onClick={() => setDay(i)}
                  >
                    {c.day} {i + 1}
                  </button>
                ))}
              </div>
              <div className="lp-day-content" aria-live="polite">
                <p className="lp-day-title">{c.dayNames[day]}</p>
                {c.stops[day].map((stop, i) => (
                  <div className="lp-stop" key={stop}>
                    <span className="lp-stop-time">
                      {["09:00", "12:00", "17:00"][i]}
                    </span>
                    <span className="lp-stop-dot" />
                    <div>
                      <b>{stop}</b>
                      <span>
                        <FiMapPin /> Chiang Mai, Thailand
                      </span>
                    </div>
                    <FiArrowUpRight />
                  </div>
                ))}
              </div>
              <div className="lp-itinerary-bottom">
                <FiCheck />
                <span>MAKE ROOM FOR THE UNEXPECTED.</span>
              </div>
            </div>
          </div>
        </section>
        <section id="how" className="lp-wrap lp-section lp-how">
          <div>
            <p className="lp-eyebrow">THREE LITTLE STEPS</p>
            <h2>{c.stepsTitle}</h2>
            <a href={start} className="lp-button">
              {startLabel}
              <FiArrowUpRight />
            </a>
          </div>
          <ol>
            {c.steps.map(([title, desc], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="lp-wrap lp-faq">
          <h2>{c.faqTitle}</h2>
          <div>
            {c.faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <FiPlus className="lp-faq-plus" />
                  <FiMinus className="lp-faq-minus" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="lp-wrap lp-last">
          <div>
            <p className="lp-eyebrow">THE WORLD IS STILL OUT THERE.</p>
            <h2>{c.endTitle}</h2>
            <p>{c.endDesc}</p>
            <a className="lp-button lp-button-light" href={start}>
              {startLabel}
              <FiArrowUpRight />
            </a>
          </div>
          <FiCompass className="lp-last-compass" aria-hidden="true" />
        </section>
      </main>
      <footer className="lp-wrap lp-footer">
        <a className="lp-brand" href="/">
          AI LHOUNG<span className="lp-brand-dot">✳</span>
        </a>
        <p>{c.footer}</p>
        <span>MADE FOR YOUR NEXT ADVENTURE ↗</span>
      </footer>
    </div>
  );
}
