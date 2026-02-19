import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

export default function LandingPage() {
  const navRef = useRef(null);
  const navLinksRef = useRef(null);
  const toggleRef = useRef(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    // Scroll reveal
    const els = document.querySelectorAll('.lp .reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  const toggleMobile = () => {
    navLinksRef.current?.classList.toggle('active');
    toggleRef.current?.classList.toggle('open');
  };

  const closeMobile = () => {
    navLinksRef.current?.classList.remove('active');
    toggleRef.current?.classList.remove('open');
  };

  return (
    <div className={`lp${darkMode ? ' lp-dark' : ''}`}>
      {/* Nav */}
      <nav className="lp-nav" ref={navRef}>
        <div className="lp-nav-inner">
          <a href="#" className="lp-logo">
            <span className="lp-logo-icon">&#9764;</span> PharmaGuard
          </a>
          <div className="lp-nav-links" ref={navLinksRef}>
            <a href="#features" onClick={closeMobile}>Features</a>
            <a href="#how-it-works" onClick={closeMobile}>How It Works</a>
            <a href="#drugs" onClick={closeMobile}>Supported Drugs</a>
            <Link to="/app" className="lp-btn lp-btn-sm" onClick={closeMobile}>Launch App</Link>
          </div>
          <button className="lp-mobile-toggle" ref={toggleRef} aria-label="Toggle menu" onClick={toggleMobile}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-container lp-hero-content">
          <div className="lp-badge">RIFT 2026 &middot; HealthTech Track</div>
          <h1>Precision Medicine,<br /><span className="lp-gradient-text">Powered by AI</span></h1>
          <p className="lp-hero-sub">
            Upload a patient's genetic data. Get instant pharmacogenomic risk predictions
            with clinically actionable recommendations — explainable, accurate, life-saving.
          </p>
          <div className="lp-hero-actions">
            <Link to="/app" className="lp-btn lp-btn-primary lp-btn-lg">
              <span className="lp-btn-icon">&#8599;</span> Analyze VCF File
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-ghost lp-btn-lg">Learn More</a>
          </div>
          <div className="lp-hero-stats">
            <div className="lp-stat">
              <span className="lp-stat-num">8</span>
              <span className="lp-stat-label">Critical Genes</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-num">6</span>
              <span className="lp-stat-label">Drug Classes</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-num">5</span>
              <span className="lp-stat-label">Risk Levels</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-num">CPIC</span>
              <span className="lp-stat-label">Guideline Aligned</span>
            </div>
          </div>
        </div>
        <div className="lp-hero-visual">
          <div className="lp-dna-helix">
            <div className="lp-strand lp-strand-1" />
            <div className="lp-strand lp-strand-2" />
            <div className="lp-strand lp-strand-3" />
            <div className="lp-strand lp-strand-4" />
            <div className="lp-strand lp-strand-5" />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="lp-problem">
        <div className="lp-container">
          <div className="lp-problem-card reveal">
            <div className="lp-problem-icon">&#9888;</div>
            <div className="lp-problem-text">
              <h2>100,000+ lives lost annually</h2>
              <p>Adverse drug reactions kill over 100,000 Americans every year. Many of these deaths are preventable through pharmacogenomic testing — analyzing how genetic variants affect drug metabolism.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="lp-features">
        <div className="lp-container">
          <div className="lp-section-header reveal">
            <span className="lp-section-tag">Capabilities</span>
            <h2>Everything you need for<br /><span className="lp-gradient-text">genomic drug safety</span></h2>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: '🔑', title: 'VCF Parsing', desc: 'Industry-standard Variant Call Format v4.2 parsing with automatic gene identification across CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, and DPYD.' },
              { icon: '⚡', title: 'Risk Prediction', desc: 'AI-driven risk assessment classifying drug interactions as Safe, Adjust Dosage, Toxic, Ineffective, or Unknown with confidence scoring.' },
              { icon: '🧠', title: 'LLM Explanations', desc: 'Transparent, clinically-grounded explanations with specific variant citations and biological mechanism breakdowns.' },
              { icon: '📊', title: 'CPIC Aligned', desc: 'Dosing recommendations aligned with Clinical Pharmacogenetics Implementation Consortium guidelines for clinical accuracy.' },
              { icon: '📄', title: 'Structured Output', desc: 'Standardized JSON output with patient profiles, pharmacogenomic data, clinical recommendations, and quality metrics.' },
              { icon: '🛡️', title: 'Clinical UX', desc: 'Color-coded risk labels, expandable details, downloadable reports, and copy-to-clipboard — designed for clinical workflows.' },
            ].map((f, i) => (
              <div className="lp-feature-card reveal" key={i}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="lp-how-it-works">
        <div className="lp-container">
          <div className="lp-section-header reveal">
            <span className="lp-section-tag">Workflow</span>
            <h2>Three steps to<br /><span className="lp-gradient-text">safer prescriptions</span></h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step reveal">
              <div className="lp-step-num">01</div>
              <div className="lp-step-content">
                <h3>Upload VCF</h3>
                <p>Drag & drop or select a patient VCF file (up to 5 MB). The file is validated automatically before processing.</p>
              </div>
            </div>
            <div className="lp-step-line" />
            <div className="lp-step reveal">
              <div className="lp-step-num">02</div>
              <div className="lp-step-content">
                <h3>Select Drugs</h3>
                <p>Choose one or more drugs from the supported list — or type a drug name. Multi-drug analysis is fully supported.</p>
              </div>
            </div>
            <div className="lp-step-line" />
            <div className="lp-step reveal">
              <div className="lp-step-num">03</div>
              <div className="lp-step-content">
                <h3>Get Results</h3>
                <p>Receive color-coded risk predictions, clinical recommendations, and AI-generated explanations — instantly downloadable as JSON.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Drugs */}
      <section id="drugs" className="lp-drugs">
        <div className="lp-container">
          <div className="lp-section-header reveal">
            <span className="lp-section-tag">Supported</span>
            <h2>Drugs we analyze</h2>
          </div>
          <div className="lp-drug-grid">
            {[
              { gene: 'CYP2D6',  name: 'Codeine',      desc: 'Pain relief — risk of toxicity in ultra-rapid metabolizers' },
              { gene: 'CYP2C9',  name: 'Warfarin',     desc: 'Anticoagulant — bleeding risk with poor metabolizers' },
              { gene: 'CYP2C19', name: 'Clopidogrel',  desc: 'Antiplatelet — reduced efficacy in poor metabolizers' },
              { gene: 'SLCO1B1', name: 'Simvastatin',  desc: 'Statin — myopathy risk with transporter variants' },
              { gene: 'TPMT',    name: 'Azathioprine', desc: 'Immunosuppressant — myelosuppression in poor metabolizers' },
              { gene: 'DPYD',    name: 'Fluorouracil', desc: 'Chemotherapy — life-threatening toxicity with DPD deficiency' },
            ].map((d, i) => (
              <div className="lp-drug-card reveal" key={i}>
                <div className="lp-drug-gene">{d.gene}</div>
                <h3>{d.name}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Levels */}
      <section className="lp-risk-levels">
        <div className="lp-container">
          <div className="lp-section-header reveal">
            <span className="lp-section-tag">Output</span>
            <h2>Risk classification</h2>
          </div>
          <div className="lp-risk-grid">
            <div className="lp-risk-pill lp-risk-safe reveal"><span className="lp-risk-dot" /> Safe</div>
            <div className="lp-risk-pill lp-risk-adjust reveal"><span className="lp-risk-dot" /> Adjust Dosage</div>
            <div className="lp-risk-pill lp-risk-toxic reveal"><span className="lp-risk-dot" /> Toxic</div>
            <div className="lp-risk-pill lp-risk-ineffective reveal"><span className="lp-risk-dot" /> Ineffective</div>
            <div className="lp-risk-pill lp-risk-unknown reveal"><span className="lp-risk-dot" /> Unknown</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="analyze" className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-card reveal">
            <h2>Ready to predict<br /><span className="lp-gradient-text">drug-gene interactions?</span></h2>
            <p>Upload a VCF file and select your drugs to receive AI-powered pharmacogenomic risk analysis in seconds.</p>
            <div className="lp-cta-actions">
              <Link to="/app" className="lp-btn lp-btn-primary lp-btn-lg">
                <span className="lp-btn-icon">&#9889;</span> Launch PharmaGuard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-logo-icon">&#9764;</span> PharmaGuard
            <span className="lp-footer-sep">&middot;</span>
            <span className="lp-footer-tagline">RIFT 2026 — HealthTech Track</span>
          </div>
          <div className="lp-footer-links">
            <a href="https://github.com/Ramsaheb/PW-Hackthone" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#">Demo Video</a>
            <Link to="/app">Launch App</Link>
          </div>
          <p className="lp-footer-copy">&copy; 2026 PharmaGuard. Built for RIFT 2026 Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
