import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import UserNavbar from '../components/UserNavbar'

const INTRO_SEEN_KEY = 'laundrygo_landing_intro_seen'

function LandingPage() {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [showIntro, setShowIntro] = useState(() => sessionStorage.getItem(INTRO_SEEN_KEY) !== 'true')
  const [skipVisible, setSkipVisible] = useState(false)
  const [introLeaving, setIntroLeaving] = useState(false)

  useEffect(() => {
    if (!showIntro) return undefined
    const skipTimer = window.setTimeout(() => setSkipVisible(true), 3000)
    return () => window.clearTimeout(skipTimer)
  }, [showIntro])

  useEffect(() => {
    if (!showIntro) return undefined
    document.documentElement.classList.add('landing-intro-scroll-lock')
    document.body.classList.add('landing-intro-scroll-lock')
    return () => {
      document.documentElement.classList.remove('landing-intro-scroll-lock')
      document.body.classList.remove('landing-intro-scroll-lock')
    }
  }, [showIntro])

  const finishIntro = () => {
    if (introLeaving) return
    sessionStorage.setItem(INTRO_SEEN_KEY, 'true')
    setIntroLeaving(true)
    window.setTimeout(() => setShowIntro(false), 780)
  }

  return (
    <div className="page">
      <UserNavbar />

      {showIntro && (
        <div className={`landing-intro ${introLeaving ? 'is-leaving' : ''}`}>
          <video
            className="landing-intro-video"
            src="/outputmp_.mp4"
            autoPlay
            muted
            playsInline
            onEnded={finishIntro}
          />
          <div className="landing-intro-shade" />
          {skipVisible && (
            <button className="landing-intro-skip" onClick={finishIntro}>
              {t('landing.introSkip')}
            </button>
          )}
        </div>
      )}

      <section className="landing-hero">
        <img src="/framecuoi.png" alt={t('landing.heroImageAlt')} className="landing-hero-bg" />
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <p className="landing-hero-kicker">{t('landing.heroKicker')}</p>
          <h1 className="landing-hero-title">
            {t('landing.heroTitle')}
          </h1>
          <p className="landing-hero-text">
            {t('landing.heroText')}
          </p>
          <div className="landing-hero-actions">
            <button className="landing-hero-btn primary" onClick={() => navigate(localizePath('/all-shops', language))}>
              {t('landing.heroPrimaryCta')}
            </button>
            <button className="landing-hero-btn secondary" onClick={() => navigate(localizePath('/all-shops/AS-001/track', language))}>
              {t('landing.heroSecondaryCta')}
            </button>
          </div>
        </div>
      </section>

      <div className="landing-card" id="landing-services">
        <section className="left-section">
          <div className="left-content">
            <div className="left-text">
              <h1 className="headline">
                {t('landing.headlineLine1')} <span className="accent-blue">{t('landing.headlineLine2')}</span>
                <br />
                <span className="accent-teal">{t('landing.headlineLine3')}</span>
                <br />
              </h1>
            </div>

            <div className="shirt-image-wrapper">
              <img
                src="/image1.jpg"
                alt="Freshly laundered white shirt"
                className="shirt-image"
              />
            </div>
          </div>
        </section>

        <section className="right-section">
          <div className="map-wrapper">
            <img
              src="/image2.jpg"
              alt="Map showing laundry delivery route in Ho Chi Minh City"
              className="map-image"
            />
          </div>
        </section>
      </div>

      <div className="about-wrapper">
        <section className="about-section">
          <div className="about-images">
            <div className="about-image about-image-top">
              <img
                src="/about1.jpg"
                alt="Laundry basket in front of washing machine"
              />
            </div>
            <div className="about-image about-image-bottom">
              <img
                src="/about2.jpg"
                alt="Folded clothes and laundry equipment"
              />
            </div>
          </div>

          <div className="about-text">
            <h2 className="about-title">{t('landing.aboutTitle')}</h2>
            <p className="about-paragraph">{t('landing.aboutText')}</p>
          </div>
        </section>
      </div>

      <div className="values-wrapper">
        <section className="values-section">
          <p className="values-label">{t('landing.valuesLabel')}</p>
          <h2 className="values-title">
            {t('landing.valuesTitleLine1')}
            <br />
            {t('landing.valuesTitleLine2')}
          </h2>

          <div className="values-columns">
            <div className="value-item">
              <img
                src="/star.jpg"
                alt="Five star rating"
                className="value-stars"
              />
              <p className="value-description">{t('landing.valuePrideDesc')}</p>
              <p className="value-tag">{t('landing.valuePride')}</p>
            </div>

            <div className="value-item">
              <img
                src="/star.jpg"
                alt="Five star rating"
                className="value-stars"
              />
              <p className="value-description">{t('landing.valueAdvancementDesc')}</p>
              <p className="value-tag">{t('landing.valueAdvancement')}</p>
            </div>

            <div className="value-item">
              <img
                src="/star.jpg"
                alt="Five star rating"
                className="value-stars"
              />
              <p className="value-description">{t('landing.valueCaringDesc')}</p>
              <p className="value-tag">{t('landing.valueCaring')}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="pickup-wrapper">
        <section className="pickup-section">
          <h2 className="pickup-title">{t('landing.pickupTitle')}</h2>

          <div className="pickup-layout">
            <div className="pickup-column pickup-column-left">
              <div className="pickup-item">
                <h3 className="pickup-item-title">{t('landing.skipTrip')}</h3>
                <p className="pickup-item-text">{t('landing.skipTripDesc')}</p>
              </div>

              <div className="pickup-item">
                <h3 className="pickup-item-title">{t('landing.samePrice')}</h3>
                <p className="pickup-item-text">{t('landing.samePriceDesc')}</p>
              </div>
            </div>

            <div className="pickup-van">
              <img
                src="/vancar.jpg"
                alt="LaundryGo delivery van"
                className="pickup-van-image"
              />
            </div>

            <div className="pickup-column pickup-column-right">
              <div className="pickup-item">
                <h3 className="pickup-item-title">{t('landing.moreServices')}</h3>
                <p className="pickup-item-text">{t('landing.moreServicesDesc')}</p>
              </div>

              <div className="pickup-item">
                <h3 className="pickup-item-title">{t('landing.getStarted')}</h3>
                <p className="pickup-item-text">{t('landing.getStartedDesc')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-text">
                Laundry<span>Go</span>
              </span>
              <span className="logo-bubbles">
                <span className="bubble bubble-lg" />
                <span className="bubble bubble-md" />
                <span className="bubble bubble-sm" />
              </span>
            </div>
            <p className="footer-description">
              {t('landing.footerDescription')}
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">{t('landing.footerCompany')}</h4>
              <a href="#" className="footer-link">
                {t('landing.footerAbout')}
              </a>
              <a href="#" className="footer-link">
                {t('landing.footerBlog')}
              </a>
              <a href="#" className="footer-link">
                {t('landing.footerPartner')}
              </a>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">{t('landing.footerSupport')}</h4>
              <a href="#" className="footer-link">
                {t('landing.footerHelpCenter')}
              </a>
              <a href="#" className="footer-link">
                {t('landing.footerFAQ')}
              </a>
              <a href="#" className="footer-link">
                {t('landing.footerTerms')}
              </a>
            </div>

            <div className="footer-column footer-newsletter">
              <h4 className="footer-heading">{t('landing.footerNewsletter')}</h4>
              <label className="footer-label" htmlFor="newsletter-email">
                {t('landing.footerEmail')}
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder={t('landing.footerPlaceholder')}
                className="footer-input"
              />
              <p className="footer-note">{t('landing.footerNewsletterNote')}</p>
              <button className="footer-button">{t('landing.footerSubscribe')}</button>
            </div>
          </div>
        </div>

        <p className="footer-bottom">{t('landing.footerCopyright')}</p>
      </footer>
    </div>
  )
}

export default LandingPage

