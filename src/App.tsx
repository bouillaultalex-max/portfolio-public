import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Braces, Check, ChevronRight,
  CircleCheck, CircleDashed, Code2, Download, ExternalLink, FlaskConical, Github, Linkedin, Mail, MapPin, Menu, Play,
  Network, Orbit, ScanSearch, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { contact } from './config'
import { cvFor } from './lib/contact'
import { cases, copy, statusCheckedOn, statusKeys, type CaseStudy, type Demo, type Locale, type StatusKey } from './content'

const sectionIds = ['projects', 'approach', 'about', 'contact'] as const
const statusIcons: Record<StatusKey, typeof Check> = { built: CircleCheck, tested: FlaskConical, planned: CircleDashed }

// Priorité : ?lang= dans l'URL, puis choix mémorisé, puis langue du navigateur.
function initialLocale(): Locale {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl === 'fr' || fromUrl === 'en') return fromUrl
  try {
    const stored = localStorage.getItem('locale')
    if (stored === 'fr' || stored === 'en') return stored
  } catch { /* stockage indisponible : on ignore */ }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

function formatDate(iso: string, locale: Locale) {
  return new Date(iso + 'T12:00:00').toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatusBoard({ item, locale }: { item: CaseStudy, locale: Locale }) {
  const t = copy[locale]
  return (
    <div className="status-board">
      {statusKeys.map(key => {
        const Icon = statusIcons[key]
        return (
          <div className={`status-column status-${key}`} key={key}>
            <h4><Icon size={15} aria-hidden="true"/>{t.statusLabels[key]}</h4>
            <ul>{item.status[key][locale].map(text => <li key={text}>{text}</li>)}</ul>
          </div>
        )
      })}
    </div>
  )
}

function Brand({ label }: { label: string }) {
  return (
    <a href="#home" className="brand" aria-label={label}>
      <span className="brand-mark" aria-hidden="true">A<span className="brand-slash">/</span></span>
      <span className="brand-name">ALEXANDRE<span>BOUILLAULT</span></span>
    </a>
  )
}

function ArchitectureVisual({ variant }: { variant: 'hero' | 'jarvis' | 'mes' }) {
  if (variant === 'mes') {
    return (
      <div className="project-illustration mes-illustration" aria-hidden="true">
        <div className="visual-topline"><span className="visual-led" /> MES <span className="visual-pill">BATCH FLOW</span></div>
        <div className="batch-overview">
          <div className="batch-label">PRODUCTION FLOW <span>OVERVIEW / 001</span></div>
          <div className="batch-route">
            <div className="batch-tile"><span className="tile-icon">01</span><span>Inventory</span><Check size={13}/></div>
            <ChevronRight size={17} />
            <div className="batch-tile is-active"><span className="tile-icon">02</span><span>Feasibility</span><Check size={13}/></div>
            <ChevronRight size={17} />
            <div className="batch-tile"><span className="tile-icon">03</span><span>Traceability</span><Check size={13}/></div>
          </div>
          <div className="batch-bars"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
        </div>
        <div className="visual-footer"><span>PRODUCT DESIGN</span><span>RULES → WORKFLOWS</span></div>
      </div>
    )
  }
  if (variant === 'jarvis') {
    return (
      <div className="project-illustration jarvis-illustration" aria-hidden="true">
        <div className="visual-topline"><span className="visual-led" /> JARVIS <span className="visual-pill">AGENT CORE</span></div>
        <div className="agent-map">
          <div className="agent-node agent-source">MISSION<span>Understand request</span></div>
          <div className="agent-wire" />
          <div className="agent-node agent-center"><Orbit size={25}/><span>AGENT LOOP</span></div>
          <div className="agent-wires"><span/><span/><span/></div>
          <div className="agent-subnodes"><div>TOOLS</div><div>MEMORY</div><div>VERIFY</div></div>
        </div>
        <div className="visual-footer"><span>TOOL ORCHESTRATION</span><span>MISSION → RESULT</span></div>
      </div>
    )
  }
  return (
    <div className="hero-workspace" aria-hidden="true">
      <div className="workspace-head"><span><span className="workspace-dot" /> PRODUCT / AI WORKSPACE</span><span className="workspace-head-meta">DESIGN SYSTEM · 01</span></div>
      <div className="workspace-body">
        <div className="workspace-command"><span className="command-symbol">&gt;_</span> Build what matters<span className="command-cursor" /></div>
        <div className="workspace-flow">
          <div className="workspace-node"><ScanSearch size={17}/><span>DISCOVER</span><small>Find the problem</small></div>
          <div className="flow-connector"><span/></div>
          <div className="workspace-node workspace-node-active"><Network size={17}/><span>BUILD</span><small>Ship a prototype</small></div>
          <div className="flow-connector"><span/></div>
          <div className="workspace-node"><ShieldCheck size={17}/><span>VERIFY</span><small>Check the result</small></div>
        </div>
        <div className="workspace-bottom">
          <div className="workspace-console"><span className="console-title">WORKING PRINCIPLES</span><span><Check size={13}/> User need first</span><span><Check size={13}/> AI-assisted implementation</span><span><Check size={13}/> Explicit validation</span></div>
          <div className="workspace-metric"><span className="mini-rings"><i/><i/><i/></span><strong>BUILD<br/>WITH<br/><em>INTENT.</em></strong></div>
        </div>
      </div>
      <div className="workspace-foot"><span>SELECTED WORK / 2026</span><span>FR · EN</span></div>
    </div>
  )
}

function DemoItem({ demo, locale }: { demo: Demo, locale: Locale }) {
  const t = copy[locale]
  const id = 'demo-' + (demo.video?.file ?? demo.title.en.toLowerCase().replace(/[^a-z]+/g, '-'))
  const src = demo.video && `/demos/${demo.video.file}-${locale}`
  return (
    <li className={`demo-${demo.state}`}>
      <div className="demo-head"><strong id={id + '-title'}>{demo.title[locale]}</strong><span className="demo-badges"><span className="demo-badge">{t.demoStates[demo.state]}</span>{demo.state === 'runnable' && <span className={'demo-badge' + (demo.filmed ? '' : ' demo-badge-pending')}>{demo.filmed ? t.demoFilmed : t.demoNotFilmed}</span>}</span></div>
      {demo.objective && <p><span className="demo-label">{t.demoObjective}{t.colon}</span>{demo.objective[locale]}</p>}
      <p>{demo.objective && <span className="demo-label">{t.demoShows}{t.colon}</span>}{demo.detail[locale]}</p>
      {demo.video && <p className="demo-method"><span className="demo-label">{t.demoMethodLabel}{t.colon}</span>{t.demoMethod}</p>}
      {demo.video && src && <>
        <video className="demo-video" controls muted playsInline preload="none" width={1280} height={720} poster={src + '-poster.webp'} aria-labelledby={id + '-title'} aria-describedby={id + '-steps'}>
          <source src={src + '.mp4'} type="video/mp4"/>
          {t.demoVideoFallback} <a href={src + '.mp4'}>{t.demoDownload}</a>
        </video>
        <p className="demo-meta">{t.demoVideoLabel} · {demo.video.duration[locale]}</p>
      </>}
      {demo.steps && <details className="demo-steps" id={id + '-steps'}><summary>{t.demoSteps}</summary><ol>{demo.steps[locale].map(step => <li key={step}>{step}</li>)}</ol></details>}
      {demo.limits && <p><span className="demo-label">{t.demoLimits}{t.colon}</span>{demo.limits[locale]}</p>}
      {demo.link && <a className="decision-trace" href={demo.link} target="_blank" rel="noopener noreferrer">{demo.state === 'online' ? t.demoOpenOnline : t.demoOpen}<span className="sr-only">{t.colon}{demo.title[locale]}</span><ExternalLink size={12} aria-hidden="true"/><span className="sr-only"> {t.newTab}</span></a>}
    </li>
  )
}

function CaseStudyDialog({ item, locale, focusDemos, onClose }: { item: CaseStudy | null, locale: Locale, focusDemos: boolean, onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const t = copy[locale]
  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    if (item && !node.open) node.showModal()
    if (!item && node.open) node.close()
    document.documentElement.classList.toggle('dialog-open', Boolean(item))
    if (item && focusDemos) {
      const heading = node.querySelector<HTMLElement>('#case-demos')
      heading?.scrollIntoView({ block: 'start' })
      heading?.focus({ preventScroll: true })
    }
  }, [item, focusDemos])
  return (
    <dialog ref={dialogRef} className="case-dialog" onClose={onClose} onClick={(event) => { if (event.target === dialogRef.current) onClose() }} aria-labelledby="case-title">
      {item && <div className="dialog-body">
        <div className="dialog-header"><span className="eyebrow">{t.caseEyebrow} / {item.number}</span><button className="icon-button" onClick={onClose} aria-label={t.caseClose}><X size={21}/></button></div>
        <div className="dialog-intro"><span className="project-status"><span className="tiny-dot"/>{item.stage[locale]}</span><h2 id="case-title">{item.title}<span className="period">.</span></h2><p>{item.description[locale]}</p><div className="tag-list">{item.tags.map(tag => <span key={tag} className="skill-tag">{tag}</span>)}</div></div>
        <div className="dialog-columns"><div className="dialog-section"><h3>{t.problem}</h3><p>{item.problem[locale]}</p></div><div className="dialog-section"><h3>{t.role}</h3><p>{item.role[locale]}</p></div></div>
        <div className="dialog-section"><h3>{t.usersTitle}</h3><ul className="user-list">{item.users.map(user => <li key={user.who[locale]}><strong>{user.who[locale]}</strong><span>{user.need[locale]}</span></li>)}</ul>{item.usersNote && <p className="status-help">{item.usersNote[locale]}</p>}</div>
        <div className="dialog-section"><h3>{t.statusTitle}</h3><p className="status-help">{t.statusHelp}</p><StatusBoard item={item} locale={locale}/><p className="status-source">{item.statusSource
          ? <a href={item.statusSource} target="_blank" rel="noopener noreferrer">{t.statusSourceLabel} {formatDate(statusCheckedOn, locale)}<ExternalLink size={12} aria-hidden="true"/><span className="sr-only"> {t.newTab}</span></a>
          : <span>{t.statusSourceInternal} {formatDate(statusCheckedOn, locale)}</span>}</p></div>
        <div className="dialog-section"><h3>{t.decisions}</h3><ul className="decision-list">{item.decisions.map(decision => <li key={decision.text[locale]}><CircleCheck size={16} aria-hidden="true"/><span><span className="decision-category">{t.decisionCategories[decision.category]}</span>{decision.text[locale]}{decision.trace && <a className="decision-trace" href={decision.trace.url} target="_blank" rel="noopener noreferrer"><span className="sr-only">{t.traceLabel} </span>{decision.trace.label}<ExternalLink size={12} aria-hidden="true"/><span className="sr-only"> {t.newTab}</span></a>}</span></li>)}</ul></div>
        {item.productExperiment && (
          <section className="dialog-section" aria-labelledby="product-experiment-heading">
            <h3 id="product-experiment-heading">{item.productExperiment.title[locale]}</h3>
            {item.productExperiment.paragraphs.map(paragraph => <p key={paragraph.fr}>{paragraph[locale]}</p>)}
          </section>
        )}
        <div className="dialog-section"><h3 id="case-demos" tabIndex={-1}>{t.demosTitle}</h3><ul className="demo-list">{item.demos.map(demo => <DemoItem key={demo.title[locale]} demo={demo} locale={locale}/>)}</ul></div>
        <div className="dialog-columns"><div className="dialog-section"><h3>{t.evidence}</h3><p>{item.proof[locale]}</p></div><div className="dialog-section"><h3>{t.boundaries}</h3><p>{item.limit[locale]}</p></div></div>
        {item.repoUrl && <a className="button button-solid" href={item.repoUrl} target="_blank" rel="noopener noreferrer"><Github size={17} aria-hidden="true"/>{t.source}<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only"> {t.newTab}</span></a>}
      </div>}
    </dialog>
  )
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCase, setActiveCase] = useState<CaseStudy | null>(null)
  const [focusDemos, setFocusDemos] = useState(false)
  const openCase = (item: CaseStudy, demos = false) => { setFocusDemos(demos); setActiveCase(item) }
  const cv = cvFor(contact, locale)
  const [activeSection, setActiveSection] = useState<string>('')
  const t = copy[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    try { localStorage.setItem('locale', locale) } catch { /* stockage indisponible : on ignore */ }
  }, [locale, t])

  // Menu mobile : fermeture par Échap et lors du passage en affichage bureau.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    const desktop = window.matchMedia('(min-width: 791px)')
    const onResize = () => { if (desktop.matches) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => { window.removeEventListener('keydown', onKey); desktop.removeEventListener('change', onResize) }
  }, [menuOpen])

  // Met en évidence la section visible dans la navigation.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    sectionIds.forEach(id => { const node = document.getElementById(id); if (node) observer.observe(node) })
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <div className="site-shell" id="home">
      <header className="site-header">
        <div className="container nav-inner">
          <Brand label={t.brandLabel} />
          <nav id="primary-nav" className={'nav-links ' + (menuOpen ? 'is-open' : '')} aria-label={t.navLabel}>
            {sectionIds.map(id => <a key={id} href={`#${id}`} onClick={closeMenu} aria-current={activeSection === id ? 'location' : undefined}>{t.nav[id]}</a>)}
          </nav>
          <div className="nav-actions"><div className="language-picker" role="group" aria-label={t.languageLabel}><button onClick={() => setLocale('fr')} aria-pressed={locale === 'fr'} className={locale === 'fr' ? 'selected' : ''} lang="fr" aria-label="Français">FR</button><span aria-hidden="true">/</span><button onClick={() => setLocale('en')} aria-pressed={locale === 'en'} className={locale === 'en' ? 'selected' : ''} lang="en" aria-label="English">EN</button></div><button className="mobile-toggle icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? t.closeMenu : t.openMenu} aria-expanded={menuOpen} aria-controls="primary-nav">{menuOpen ? <X size={23} aria-hidden="true"/> : <Menu size={23} aria-hidden="true"/>}</button></div>
        </div>
      </header>

      <main id="main">
        <section className="hero section container" aria-labelledby="hero-heading">
          <div className="hero-left"><div className="status-pill"><span className="live-indicator"/> {t.status}</div><p className="eyebrow hero-eyebrow"><span className="micro-star">✳</span> {t.heroEyebrow}</p><h1 id="hero-heading">{t.heroTitleA}<br/><span className="hero-highlight">{t.heroTitleB}</span></h1><p className="hero-description">{t.heroText}</p><div className="hero-buttons"><a className="button button-solid" href="#projects">{t.heroPrimary}<ArrowDownRight size={18} aria-hidden="true"/></a><a className="button button-outline" href="#approach">{t.heroSecondary}<ArrowRight size={17} aria-hidden="true"/></a>{cv && <a className="button button-outline" href={cv.href} download type="application/pdf"><Download size={17} aria-hidden="true"/>{t.cvDownload}{cv.otherLanguage && <span className="cv-lang"> {t.cvOtherLanguage}</span>}</a>}</div><div className="hero-lower"><span><MapPin size={15} aria-hidden="true"/>{t.location}</span><span className="hero-lower-divider"/><span>Claude Code <b>·</b> Product Thinking <b>·</b> Agents</span></div></div>
          <div className="hero-right"><div className="hero-orbit hero-orbit-one"/><div className="hero-orbit hero-orbit-two"/><div className="hero-sparkle"><Sparkles size={20}/></div><ArchitectureVisual variant="hero"/><p className="hero-visual-caption">— {t.heroVisualCaption}</p></div>
        </section>

        <section className="proof-strip" aria-label={t.proofLabel}><div className="container proof-inner"><div className="proof-small"><span className="proof-icon"><Braces size={25}/></span><span>{t.proofLabel}</span></div><div className="proof-content"><h2>{t.proofTitle}</h2><p>{t.proofText}</p></div><ArrowDownRight className="proof-arrow" size={27}/></div></section>

        <section className="section container projects-section" id="projects" aria-labelledby="projects-heading"><div className="section-heading"><div><p className="eyebrow">{t.projectsEyebrow}</p><h2 id="projects-heading">{t.projectsTitle}</h2></div><p>{t.projectsText}</p></div><ul className="status-legend" aria-label={t.statusLegend}>{statusKeys.map(key => { const Icon = statusIcons[key]; return <li key={key} className={`status-${key}`}><Icon size={14} aria-hidden="true"/>{t.statusLabels[key]}</li> })}</ul><div className="projects-grid">{cases.map((item) => <article className="project-card" key={item.id}><ArchitectureVisual variant={item.id === 'jarvis' ? 'jarvis' : 'mes'}/><div className="project-card-body"><div className="project-topline"><span className="eyebrow">{item.category[locale]}</span><span className="project-status"><span className="tiny-dot"/>{item.stage[locale]}</span></div><h3>{item.title}<span className="period">.</span></h3><p>{item.description[locale]}</p><ul className="project-highlights">{item.highlights[locale].map(text => <li key={text}><Check size={14} aria-hidden="true"/>{text}</li>)}</ul><div className="tag-list">{item.tags.map(tag=><span className="skill-tag" key={tag}>{tag}</span>)}</div>{item.demos.some(demo => demo.video) && <button className="demos-link project-demos" onClick={() => openCase(item, true)} aria-haspopup="dialog"><Play size={15} aria-hidden="true"/>{t.demosCta} ({item.demos.filter(demo => demo.video).length})<span className="sr-only">{t.colon}{item.title}</span></button>}<div className="project-actions"><button className="button button-outline case-button" onClick={() => openCase(item)} aria-haspopup="dialog">{t.seeCase}<span className="sr-only">{t.colon}{item.title}</span><ArrowUpRight size={17} aria-hidden="true"/></button>{item.repoUrl && <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" className="icon-link" aria-label={`${t.sourceAria} ${item.title} ${t.newTab}`}><Github size={19} aria-hidden="true"/><span>{t.source}</span><ExternalLink size={13} aria-hidden="true"/></a>}</div></div></article>)}</div><p className="visual-disclaimer"><span aria-hidden="true">ⓘ</span> {t.projectNote}</p></section>

        <section className="section process-section" id="approach" aria-labelledby="approach-heading"><div className="container"><div className="section-heading"><div><p className="eyebrow">{t.approachEyebrow}</p><h2 id="approach-heading">{t.approachTitle}</h2></div><p>{t.approachText}</p></div><div className="process-grid">{t.steps.map((step,i) => <div className="process-card" key={step.number}><div className="process-num">{step.number}<span aria-hidden="true">{i < 4 && <ArrowRight size={18}/>}</span></div><h3>{step.label}</h3><p>{step.detail}</p></div>)}</div></div></section>

        <section className="section container about-section" id="about" aria-labelledby="about-heading"><div className="about-main"><p className="eyebrow">{t.aboutEyebrow}</p><h2 id="about-heading">{t.aboutTitle}</h2><p>{t.aboutP1}</p><p>{t.aboutP2}</p><p>{t.aboutP3}</p><h3 className="path-title">{t.pathTitle}</h3><ol className="path-list">{t.path.map((step, i) => <li key={step.label}><span aria-hidden="true">0{i + 1}</span><div><strong>{step.label}</strong><p>{step.detail}</p></div></li>)}</ol><div className="about-highlight"><ShieldCheck size={22} aria-hidden="true"/><div><h3>{t.transparencyTitle}</h3><p>{t.transparency}</p></div></div></div><div className="skills-panel"><div className="skills-heading"><Code2 size={22} aria-hidden="true"/><h3>{t.skillsTitle}</h3></div><div className="skills-list">{t.skills.map((skill,i)=><div key={skill} className="skill-row"><span>0{i+1}</span><strong>{skill}</strong></div>)}</div></div></section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading"><div className="container contact-inner"><div className="contact-glow"/><div className="contact-copy"><p className="eyebrow">{t.contactEyebrow}</p><h2 id="contact-heading">{t.contactTitle}</h2><p>{t.contactText}</p><div className="contact-buttons">{cv && <a className="button button-solid" href={cv.href} download type="application/pdf"><Download size={18} aria-hidden="true"/>{t.cvDownload}{cv.otherLanguage && <span className="cv-lang"> {t.cvOtherLanguage}</span>}</a>}{contact.email && <a className={'button ' + (cv ? 'button-outline' : 'button-solid')} href={`mailto:${contact.email}`}><Mail size={18} aria-hidden="true"/>{t.contactEmail}<span className="contact-value"><span className="contact-sep"> · </span>{contact.email}</span></a>}{contact.linkedin && <a className="button button-outline" href={contact.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} aria-hidden="true"/>{t.contactLinkedin}<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only"> {t.newTab}</span></a>}</div></div><div className="contact-decoration" aria-hidden="true"><div className="contact-circle"><Bot size={66}/></div><span className="decoration-line"/><span className="decoration-cross">+</span></div></div></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><Brand label={t.brandLabel}/><p>© {new Date().getFullYear()} Alexandre Bouillault. {t.footer}</p><a href="#home" className="footer-top">{t.backTop}<ArrowUpRight size={17}/></a></div></footer>
    </div>
    <CaseStudyDialog item={activeCase} locale={locale} focusDemos={focusDemos} onClose={() => setActiveCase(null)}/>
  </>
}
