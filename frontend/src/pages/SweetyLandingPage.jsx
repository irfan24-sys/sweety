import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SweetyLandingPage() {
  const navigate = useNavigate();

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; }

    .sweety-page {
      min-height: 100vh;
      overflow: hidden;
      color: #242326;
      background: #f7f8fa;
      font-family: 'DM Sans', Arial, sans-serif;
    }

    .sweety-header {
      height: 68px;
      padding: 0 clamp(20px, 5.2vw, 76px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      background: rgba(255,255,255,.92);
      border-bottom: 1px solid #eee9ec;
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(14px);
    }

    .sweety-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #a84c55;
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -.5px;
    }
    .sweety-brand-mark {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 11px;
      color: #a84c55;
      background: #fff0f1;
      font-size: 19px;
    }
    .sweety-header-actions { display: flex; align-items: center; gap: 17px; }
    .sweety-signin {
      border: 0;
      padding: 9px 4px;
      background: transparent;
      color: #625d63;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .sweety-signin:hover { color: #a84c55; }
    .sweety-button {
      border: 0;
      border-radius: 999px;
      padding: 13px 22px;
      background: linear-gradient(135deg, #b65d67, #99434e);
      color: white;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 7px 17px rgba(168,76,85,.2);
      transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
    }
    .sweety-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 22px rgba(168,76,85,.26);
      filter: brightness(1.04);
    }
    .sweety-avatar {
      width: 29px;
      height: 29px;
      border: 0;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #99434e;
      color: white;
      cursor: pointer;
      font-size: 12px;
    }

    .sweety-hero {
      min-height: 690px;
      padding: 54px 20px 70px;
      text-align: center;
      background:
        radial-gradient(ellipse at 50% 45%, rgba(249,225,230,.6), transparent 44%),
        linear-gradient(180deg, #f8f9fb 0%, #f7f8fa 100%);
    }
    .sweety-eyebrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 9px;
      padding: 7px 13px;
      margin-bottom: 22px;
      border: 1px solid #f0e6e8;
      border-radius: 999px;
      background: rgba(255,255,255,.8);
      color: #766b70;
      font-size: 10px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(62,42,51,.035);
    }
    .sweety-eyebrow .dot { color: #d77d86; }
    .sweety-eyebrow .trust { color: #168b6c; }
    .sweety-hero h1 {
      max-width: 760px;
      margin: 0 auto 13px;
      color: #242326;
      font-size: clamp(34px, 5vw, 53px);
      line-height: 1.12;
      letter-spacing: -2px;
      font-weight: 800;
    }
    .sweety-hero-copy {
      max-width: 550px;
      margin: 0 auto 24px;
      color: #777179;
      font-size: 13px;
      line-height: 1.75;
    }
    .sweety-hero-cta { padding: 14px 25px; }

    .sweety-dashboard-wrap {
      width: min(100%, 610px);
      height: 260px;
      margin: 34px auto 0;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: sweety-rise .7s ease both;
    }
    .sweety-dashboard-card {
      width: 310px;
      min-height: 220px;
      padding: 21px 20px 17px;
      border: 1px solid rgba(239,231,234,.8);
      border-radius: 20px;
      background: rgba(255,255,255,.96);
      box-shadow: 0 13px 35px rgba(74,48,59,.09);
      position: relative;
      z-index: 1;
    }
    .sweety-dashboard-orb {
      width: 145px;
      height: 145px;
      margin: 0 auto 14px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: radial-gradient(circle, #fff 0 34%, #fff0f2 35% 67%, rgba(255,239,241,.25) 68% 100%);
      position: relative;
    }
    .sweety-phone {
      width: 76px;
      height: 104px;
      padding: 12px 7px 8px;
      border: 1px solid #f0e6e8;
      border-radius: 15px;
      background: #fff;
      box-shadow: 0 7px 18px rgba(180,100,115,.11);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    .sweety-phone-label { color: #159b75; font-size: 6px; font-weight: 800; letter-spacing: .5px; }
    .sweety-phone-number { color: #343139; font-size: 23px; line-height: 1; font-weight: 800; }
    .sweety-phone-unit { color: #8a858b; font-size: 7px; }
    .sweety-phone-line { width: 45px; height: 13px; }
    .sweety-heart {
      position: absolute;
      color: #e9858b;
      font-size: 15px;
    }
    .sweety-heart.one { left: 17px; top: 58px; }
    .sweety-heart.two { right: 17px; top: 58px; }
    .sweety-heart.three { bottom: 13px; left: calc(50% - 7px); }
    .sweety-sync {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 9px 11px;
      border-radius: 9px;
      background: #f3f5f6;
      color: #625d63;
      font-size: 8px;
    }
    .sweety-sync strong { margin-left: auto; color: #159b75; font-size: 7px; }
    .sweety-status {
      position: absolute;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border: 1px solid #f2edf0;
      border-radius: 13px;
      background: white;
      box-shadow: 0 9px 24px rgba(55,40,48,.08);
      text-align: left;
      animation: sweety-float 4s ease-in-out infinite;
    }
    .sweety-status-left { left: 0; top: 90px; }
    .sweety-status-right { right: 0; bottom: 43px; animation-delay: -1.4s; }
    .sweety-status-icon {
      width: 31px;
      height: 31px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: #e4f8f0;
      color: #159b75;
      font-size: 15px;
    }
    .sweety-status-icon.rose { background: #f9e9eb; color: #a84c55; }
    .sweety-status small { display: block; margin-bottom: 3px; color: #8a8288; font-size: 7px; font-weight: 700; letter-spacing: .3px; }
    .sweety-status strong { display: block; color: #29252a; font-size: 11px; }
    .sweety-status strong.green { color: #168b6c; }

    .sweety-bottom-cta {
      width: min(calc(100% - 40px), 1120px);
      margin: 8px auto 65px;
      padding: 44px 24px 39px;
      border: 1px solid rgba(239,218,221,.75);
      border-radius: 21px;
      background: linear-gradient(115deg, #ffdddd 0%, #f8e5e6 54%, #ecebed 100%);
      box-shadow: 0 9px 20px rgba(70,47,55,.09);
      text-align: center;
    }
    .sweety-cta-heart {
      width: 36px;
      height: 36px;
      margin: 0 auto 12px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: white;
      color: #a84c55;
      font-size: 16px;
    }
    .sweety-bottom-cta h2 {
      margin: 0 0 7px;
      color: #4c2028;
      font-size: clamp(24px, 3vw, 32px);
      line-height: 1.2;
      letter-spacing: -.8px;
    }
    .sweety-bottom-cta p {
      max-width: 510px;
      margin: 0 auto 20px;
      color: #8a5960;
      font-size: 12px;
      line-height: 1.7;
    }
    .sweety-benefits {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 17px;
      margin-top: 16px;
      color: #8a5960;
      font-size: 9px;
      font-weight: 600;
    }
    .sweety-benefits span::before { content: '✓'; margin-right: 5px; color: #168b6c; font-weight: 800; }

    .sweety-footer {
      min-height: 76px;
      padding: 17px clamp(20px, 5.2vw, 76px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      background: #fff;
      border-top: 1px solid #eee9ec;
    }
    .sweety-footer-brand { color: #353036; font-size: 12px; font-weight: 800; }
    .sweety-footer-note { display: block; margin-top: 4px; color: #8b858b; font-size: 9px; }
    .sweety-footer-links { display: flex; flex-wrap: wrap; gap: 17px; }
    .sweety-footer-links a { color: #777179; text-decoration: none; font-size: 9px; }
    .sweety-footer-links a:hover { color: #a84c55; }

    @keyframes sweety-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
    @keyframes sweety-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 640px) {
      .sweety-header { height: 62px; padding: 0 17px; }
      .sweety-brand { font-size: 17px; }
      .sweety-header-actions { gap: 10px; }
      .sweety-signin { display: none; }
      .sweety-header .sweety-button { padding: 11px 15px; font-size: 10px; }
      .sweety-avatar { width: 27px; height: 27px; }
      .sweety-hero { min-height: auto; padding: 47px 17px 47px; }
      .sweety-eyebrow { gap: 6px; padding: 7px 10px; font-size: 8px; }
      .sweety-hero h1 { max-width: 430px; font-size: clamp(32px, 9vw, 43px); letter-spacing: -1.5px; }
      .sweety-hero-copy { max-width: 390px; font-size: 12px; }
      .sweety-dashboard-wrap { height: 245px; margin-top: 30px; }
      .sweety-dashboard-card { width: min(270px, 75vw); min-height: 205px; padding: 15px; }
      .sweety-dashboard-orb { width: 133px; height: 133px; margin-bottom: 10px; }
      .sweety-status { gap: 7px; padding: 9px; }
      .sweety-status-left { left: -3px; top: 86px; }
      .sweety-status-right { right: -3px; bottom: 35px; }
      .sweety-status-icon { width: 26px; height: 26px; font-size: 12px; }
      .sweety-status small { font-size: 6px; }
      .sweety-status strong { font-size: 9px; }
      .sweety-bottom-cta { width: calc(100% - 30px); margin: 0 auto 42px; padding: 34px 17px 30px; border-radius: 17px; }
      .sweety-bottom-cta p { font-size: 11px; }
      .sweety-benefits { gap: 10px 14px; font-size: 8px; }
      .sweety-footer { align-items: flex-start; flex-direction: column; padding: 19px 20px; }
      .sweety-footer-links { gap: 14px; }
    }

    @media (max-width: 370px) {
      .sweety-status-left { left: -8px; }
      .sweety-status-right { right: -8px; }
      .sweety-status { padding: 7px; }
      .sweety-status-icon { display: none; }
      .sweety-eyebrow { max-width: 310px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
    }
  `;

  return (
    <div className="sweety-page">
      <style>{styles}</style>

      <header className="sweety-header">
        <Link to="/" className="sweety-brand" aria-label="Sweety home">
          <span className="sweety-brand-mark" aria-hidden="true">♡</span>
          <span>Sweety</span>
        </Link>

        <div className="sweety-header-actions">
          <button className="sweety-signin" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="sweety-button" onClick={() => navigate("/signup")}>
            Get Started
          </button>
          <button
            className="sweety-avatar"
            aria-label="Sign in to your account"
            onClick={() => navigate("/login")}
          >
            ♟
          </button>
        </div>
      </header>

      <main>
        <section className="sweety-hero" aria-labelledby="sweety-heading">
          <div className="sweety-eyebrow">
            <span className="dot">✦</span>
            <span>Simple daily tracking</span>
            <span>·</span>
            <span className="trust">●</span>
            <span>Designed for everyday care</span>
          </div>

          <h1 id="sweety-heading">Glucose tracking made delightfully simple.</h1>
          <p className="sweety-hero-copy">
            Log your blood sugar in seconds, understand your patterns, and share
            clear reports with your doctor — with less everyday stress.
          </p>
          <button className="sweety-button sweety-hero-cta" onClick={() => navigate("/signup")}>
            Start Tracking Free <span aria-hidden="true" style={{ marginLeft: 9 }}>➜</span>
          </button>

          <div className="sweety-dashboard-wrap" aria-label="Illustrative glucose dashboard preview">
            <div className="sweety-status sweety-status-left">
              <span className="sweety-status-icon">↗</span>
              <span>
                <small>STABILITY</small>
                <strong className="green">94% In-Range</strong>
              </span>
            </div>

            <div className="sweety-dashboard-card">
              <div className="sweety-dashboard-orb">
                <span className="sweety-heart one">♥</span>
                <span className="sweety-heart two">♥</span>
                <span className="sweety-heart three">♥</span>
                <div className="sweety-phone">
                  <span className="sweety-phone-label">● SAMPLE</span>
                  <strong className="sweety-phone-number">108</strong>
                  <svg className="sweety-phone-line" viewBox="0 0 55 15" role="img" aria-label="Illustrative glucose trend">
                    <path d="M1 11 C9 11 12 5 20 8 S31 12 37 6 S47 6 54 2" fill="none" stroke="#159b75" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="sweety-phone-unit">mg/dL</span>
                </div>
              </div>
              <div className="sweety-sync">
                <span style={{ color: "#159b75" }}>●</span>
                <span>Demo glucose reading</span>
                <strong>EXAMPLE</strong>
              </div>
            </div>

            <div className="sweety-status sweety-status-right">
              <span className="sweety-status-icon rose">▤</span>
              <span>
                <small>SIMPLE STRUCTURE</small>
                <strong>4 Daily Meal Slots</strong>
              </span>
            </div>
          </div>
        </section>

        <section className="sweety-bottom-cta" aria-labelledby="sweety-cta-heading">
          <div className="sweety-cta-heart" aria-hidden="true">♥</div>
          <h2 id="sweety-cta-heading">Ready for calmer glucose days?</h2>
          <p>
            Take a clearer look at your daily readings and build healthier routines
            with simple tracking, helpful insights, and easy-to-read reports.
          </p>
          <button className="sweety-button" onClick={() => navigate("/signup")}>
            Get Started with Sweety — It’s Free <span aria-hidden="true" style={{ marginLeft: 8 }}>➜</span>
          </button>
          <div className="sweety-benefits">
            <span>Simple daily logging</span>
            <span>Meal-wise tracking</span>
            <span>Clear summaries</span>
          </div>
        </section>
      </main>

      <footer className="sweety-footer">
        <div>
          <span className="sweety-footer-brand">Sweety <span style={{ color: "#168b6c", fontSize: 8 }}>● HEALTH TRACKING</span></span>
          <span className="sweety-footer-note">© 2026 Sweety. Your health journey, thoughtfully supported.</span>
        </div>
        <nav className="sweety-footer-links" aria-label="Footer navigation">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/support">Support</Link>
        </nav>
      </footer>
    </div>
  );
}
