import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════

const PARAMETERS = [
  { key: 'ENTITY_CLARITY',     label: 'Entity Clarity',       group: 'entity',    desc: 'Brand defined as a structured entity across the site', weight: 1.5, liveData: true },
  { key: 'BRAND_AUTHORITY',    label: 'Brand Authority',      group: 'entity',    desc: 'Presence in external citable sources and directories', weight: 1.3, liveData: true },
  { key: 'AUTHOR_SIGNALS',     label: 'Author Signals',       group: 'entity',    desc: 'Expert authorship visible through bylines and bios',   weight: 1.0, liveData: false },
  { key: 'CITATION_POTENTIAL', label: 'Citation Potential',   group: 'entity',    desc: 'Original data and stats worth citing by LLMs',         weight: 1.2, liveData: false },
  { key: 'SEMANTIC_DEPTH',     label: 'Semantic Depth',       group: 'content',   desc: 'Topic coverage includes related entities',             weight: 1.2, liveData: false },
  { key: 'DIRECT_ANSWER',      label: 'Direct Answer Format', group: 'content',   desc: 'FAQs and definitions enable direct LLM extraction',    weight: 1.0, liveData: true },
  { key: 'CONTENT_FRESHNESS',  label: 'Content Freshness',    group: 'content',   desc: 'Visible update dates signal current relevance',        weight: 0.9, liveData: true },
  { key: 'TONE_ALIGNMENT',     label: 'Tone Alignment',       group: 'content',   desc: 'Expert tone matches conversational query patterns',    weight: 1.0, liveData: false },
  { key: 'STRUCTURED_DATA',    label: 'Structured Data',      group: 'technical', desc: 'Schema.org markup for Organization, Article, FAQ',    weight: 1.5, liveData: true },
  { key: 'LLMS_TXT',           label: 'LLMs.txt',             group: 'technical', desc: '/llms.txt or robots.txt includes LLM crawl guidance', weight: 1.1, liveData: true },
  { key: 'SEMANTIC_HTML',      label: 'Semantic HTML',        group: 'technical', desc: 'Correct H1–H6 hierarchy and semantic elements',       weight: 1.0, liveData: true },
  { key: 'CONTENT_MATCH',      label: 'Content Match',        group: 'technical', desc: 'Title, meta description and body are tightly aligned', weight: 1.0, liveData: true },
];

const GROUPS = [
  { key: 'entity',    label: 'Entity & Authority',     index: '01' },
  { key: 'content',   label: 'Content & Semantics',    index: '02' },
  { key: 'technical', label: 'Technical & Visibility', index: '03' },
];

const SECTORS = ['Technology', 'Retail & E-commerce', 'Finance & Banking', 'Healthcare', 'Media & Publishing', 'B2B Services'];

const LLMS = [
  { key: 'chatgpt',    label: 'ChatGPT',    icon: '⬡' },
  { key: 'gemini',     label: 'Gemini',     icon: '◈' },
  { key: 'claude',     label: 'Claude',     icon: '◎' },
  { key: 'perplexity', label: 'Perplexity', icon: '⊕' },
  { key: 'grok',       label: 'Grok',       icon: '✕' },
  { key: 'deepseek',   label: 'DeepSeek',   icon: '◉' },
  { key: 'mistral',    label: 'Mistral',    icon: '▲' },
];

const SHARE_OPTIONS = [
  { key: 'email',  label: 'Email',           icon: '✉' },
  { key: 'teams',  label: 'Microsoft Teams', icon: '⊞' },
  { key: 'slack',  label: 'Slack',           icon: '#' },
  { key: 'copy',   label: 'Copy link',       icon: '⎘' },
];

const SECTOR_BENCHMARKS: Record<string, Record<string, number>> = {
  'Technology':          { ENTITY_CLARITY: 71, BRAND_AUTHORITY: 68, AUTHOR_SIGNALS: 55, CITATION_POTENTIAL: 62, SEMANTIC_DEPTH: 74, DIRECT_ANSWER: 58, CONTENT_FRESHNESS: 80, TONE_ALIGNMENT: 72, STRUCTURED_DATA: 52, LLMS_TXT: 28, SEMANTIC_HTML: 75, CONTENT_MATCH: 70 },
  'Retail & E-commerce': { ENTITY_CLARITY: 65, BRAND_AUTHORITY: 58, AUTHOR_SIGNALS: 32, CITATION_POTENTIAL: 42, SEMANTIC_DEPTH: 60, DIRECT_ANSWER: 68, CONTENT_FRESHNESS: 85, TONE_ALIGNMENT: 60, STRUCTURED_DATA: 72, LLMS_TXT: 18, SEMANTIC_HTML: 68, CONTENT_MATCH: 66 },
  'Finance & Banking':   { ENTITY_CLARITY: 78, BRAND_AUTHORITY: 82, AUTHOR_SIGNALS: 70, CITATION_POTENTIAL: 75, SEMANTIC_DEPTH: 72, DIRECT_ANSWER: 65, CONTENT_FRESHNESS: 70, TONE_ALIGNMENT: 80, STRUCTURED_DATA: 58, LLMS_TXT: 22, SEMANTIC_HTML: 72, CONTENT_MATCH: 74 },
  'Healthcare':          { ENTITY_CLARITY: 70, BRAND_AUTHORITY: 76, AUTHOR_SIGNALS: 82, CITATION_POTENTIAL: 80, SEMANTIC_DEPTH: 78, DIRECT_ANSWER: 72, CONTENT_FRESHNESS: 68, TONE_ALIGNMENT: 75, STRUCTURED_DATA: 48, LLMS_TXT: 15, SEMANTIC_HTML: 70, CONTENT_MATCH: 72 },
  'Media & Publishing':  { ENTITY_CLARITY: 62, BRAND_AUTHORITY: 72, AUTHOR_SIGNALS: 85, CITATION_POTENTIAL: 78, SEMANTIC_DEPTH: 80, DIRECT_ANSWER: 75, CONTENT_FRESHNESS: 88, TONE_ALIGNMENT: 78, STRUCTURED_DATA: 55, LLMS_TXT: 32, SEMANTIC_HTML: 78, CONTENT_MATCH: 75 },
  'B2B Services':        { ENTITY_CLARITY: 58, BRAND_AUTHORITY: 55, AUTHOR_SIGNALS: 60, CITATION_POTENTIAL: 55, SEMANTIC_DEPTH: 62, DIRECT_ANSWER: 52, CONTENT_FRESHNESS: 65, TONE_ALIGNMENT: 68, STRUCTURED_DATA: 42, LLMS_TXT: 20, SEMANTIC_HTML: 65, CONTENT_MATCH: 62 },
};

const FINDINGS: Record<string, { pass: string[]; warning: string[]; fail: string[] }> = {
  ENTITY_CLARITY:     { pass: ['Organization schema detected and well-formed', 'Brand entity clearly defined in structured data'], warning: ['Schema present but missing key fields', 'Organization markup incomplete'], fail: ['No organization entity markup found', 'Brand identity not defined in structured data'] },
  BRAND_AUTHORITY:    { pass: ['Wikipedia article found for this brand', 'Strong external entity presence detected'], warning: ['Wikipedia entry exists but is sparse', 'Limited external authority signals'], fail: ['No Wikipedia entry found', 'Brand not referenced in authoritative external sources'] },
  AUTHOR_SIGNALS:     { pass: ['Author bios on all articles', 'LinkedIn profiles linked'], warning: ['Some articles lack attribution', 'Bios present but thin'], fail: ['No author attribution found', 'Content is anonymous'] },
  CITATION_POTENTIAL: { pass: ['Original research data detected', 'Proprietary statistics present'], warning: ['Some data but sources unclear', 'Stats without methodology'], fail: ['No original data found', 'Content is mostly aggregated'] },
  SEMANTIC_DEPTH:     { pass: ['Rich entity co-occurrence', 'Related topics well covered'], warning: ['Partial semantic coverage', 'Missing key related entities'], fail: ['Shallow keyword-focused content', 'Missing related entities'] },
  DIRECT_ANSWER:      { pass: ['FAQPage schema detected — LLM-extractable answers present', 'Structured Q&A markup found'], warning: ['FAQ content present but no FAQPage schema', 'Answers not structured for direct extraction'], fail: ['No FAQ schema detected', 'No structured Q&A content found'] },
  CONTENT_FRESHNESS:  { pass: ['Content updated within the last 30 days', 'Recent Last-Modified header detected'], warning: ['Content last modified 3–6 months ago', 'Freshness signal present but aging'], fail: ['No Last-Modified header detected', 'Content appears significantly outdated'] },
  TONE_ALIGNMENT:     { pass: ['Authoritative tone throughout', 'Matches conversational queries'], warning: ['Tone inconsistent across sections', 'Overly promotional in places'], fail: ['Primarily promotional tone', 'Not aligned with query intent'] },
  STRUCTURED_DATA:    { pass: ['Organization, Article and FAQ schema found', 'JSON-LD properly implemented'], warning: ['Basic schema but incomplete', 'Errors in structured data'], fail: ['No structured data detected', 'Schema validation errors'] },
  LLMS_TXT:           { pass: ['/llms.txt file found and accessible', 'LLM crawl directives are present'], warning: ['/llms.txt found but content is sparse', 'File exists but lacks clear permissions'], fail: ['No /llms.txt file found at root', 'LLM crawl guidance is absent'] },
  SEMANTIC_HTML:      { pass: ['Proper H1–H6 hierarchy', 'Semantic elements correct'], warning: ['Minor heading issues', 'Some semantic elements missing'], fail: ['Multiple H1 tags', 'No semantic HTML structure'] },
  CONTENT_MATCH:      { pass: ['Title, meta and body aligned', 'No keyword stuffing'], warning: ['Partial meta/body alignment', 'Title partially mismatched'], fail: ['Significant title/content mismatch', 'Meta unrelated to body'] },
};

const RECOMMENDATIONS: Record<string, { pass: string; warning: string; fail: string }> = {
  ENTITY_CLARITY:     { pass: 'Your Organization schema is solid. Keep sameAs links updated when adding new official profiles.', warning: 'Complete your Organization schema: add logo, description, and sameAs links to LinkedIn, Twitter/X, and Wikipedia.', fail: 'Add JSON-LD Organization schema to your homepage. Include name, url, logo, description, and sameAs links to all official profiles.' },
  BRAND_AUTHORITY:    { pass: 'Wikipedia presence confirmed. Keep the entry updated with fresh, cited information to maintain authority.', warning: 'Expand your Wikipedia entry with more citations from reliable sources. Pursue mentions in authoritative publications.', fail: 'Create or claim a Wikipedia entry for your brand. Launch a PR campaign targeting tier-1 publications and industry directories.' },
  AUTHOR_SIGNALS:     { pass: 'Link author profiles to LinkedIn and published works to strengthen the authority signal further.', warning: 'Add detailed bios with credentials to all content authors. Link to their LinkedIn profiles and any published works.', fail: 'Assign named authors to all content. Create bio pages with credentials, photos, and links to professional profiles.' },
  CITATION_POTENTIAL: { pass: 'Keep publishing original data. Create a dedicated Research section for easy discoverability by LLMs.', warning: 'Add clear methodology notes to your data. Publish at least one original study or dataset per quarter.', fail: 'Develop citable content assets: original research, proprietary surveys, industry benchmarks, or unique definitions.' },
  SEMANTIC_DEPTH:     { pass: 'Expand into adjacent topics via internal linking clusters to fill remaining semantic gaps.', warning: 'Build topical clusters around your core subject. Each pillar page should link to 5–10 supporting pages.', fail: 'Redesign your content architecture around topics, not keywords. Cover the full semantic neighborhood of your subject.' },
  DIRECT_ANSWER:      { pass: 'FAQPage schema is live. Review answer length — keep each under 60 words for optimal LLM extraction.', warning: 'Add FAQPage JSON-LD schema to your existing Q&A content. Structure answers in under 60 words each.', fail: 'Create FAQ sections for key pages using question-format H2/H3 headings, concise answers, and FAQPage schema markup.' },
  CONTENT_FRESHNESS:  { pass: 'Content is fresh. Maintain a quarterly update cycle to keep the freshness signal strong.', warning: 'Update key pages and ensure your server sends a Last-Modified header. Review content older than 3 months.', fail: 'Configure your server to send Last-Modified headers. Set up a quarterly content audit and update workflow.' },
  TONE_ALIGNMENT:     { pass: 'Maintain your editorial voice. Ensure consistency when onboarding new writers.', warning: 'Create an editorial style guide. Flag promotional copy for revision toward informative, expert-driven tone.', fail: 'Rewrite key pages in an informative, authoritative tone. Remove promotional language from educational content.' },
  STRUCTURED_DATA:    { pass: 'Test your schema with Google\'s Rich Results Test periodically. Add HowTo or Video schema where applicable.', warning: 'Fix existing schema errors via Google\'s Rich Results Test. Add missing required fields and expand to more page types.', fail: 'Implement JSON-LD: Organization on homepage, Article on blog posts, FAQ schema on resource pages.' },
  LLMS_TXT:           { pass: 'Review your /llms.txt quarterly as the LLM crawling landscape evolves. Add new agent directives as needed.', warning: 'Expand your /llms.txt with clear content permissions, preferred citation format, and contact info for AI licensing.', fail: 'Create /llms.txt at your domain root. Define which content AI agents can index, your preferred citation format, and licensing contact.' },
  SEMANTIC_HTML:      { pass: 'Run periodic Lighthouse audits to catch heading hierarchy regressions as new content is published.', warning: 'Fix heading hierarchy: ensure one H1 per page and logical H2/H3 nesting. Replace generic divs with semantic elements.', fail: 'Audit your HTML structure. Implement a single H1, logical heading hierarchy, and semantic elements: article, main, section, nav.' },
  CONTENT_MATCH:      { pass: 'Review title/meta alignment on new content before publishing. Keep titles under 60 characters.', warning: 'Align title tags and meta descriptions with actual page content. Rewrite titles that don\'t reflect the content.', fail: 'Audit all title tags and meta descriptions. Each must accurately summarize the page content.' },
};

// ═══════════════════════════════════════════════════════════════════
// ACTION PLAN DATA  (Step 2)
// ═══════════════════════════════════════════════════════════════════

type EffortLevel   = 'low' | 'medium' | 'high';
type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

interface ActionDetail {
  priority:    PriorityLevel;
  effort:      EffortLevel;
  effortValue: number;
  impactValue: number;
  timeEst:     string;
  steps:       string[];
  outcome:     string;
  snippet?:    string;
}

interface ActionDef {
  pass:    string;
  warning: ActionDetail;
  fail:    ActionDetail;
}

const ACTIONS: Record<string, ActionDef> = {
  ENTITY_CLARITY: {
    pass: 'Organization schema is solid. Keep sameAs links updated whenever you add new official profiles.',
    warning: {
      priority: 'high', effort: 'low', effortValue: 1, impactValue: 3, timeEst: '2–3 hours',
      steps: [
        'Open your homepage template and locate the <head> block.',
        'Find your existing Organization JSON-LD and add the missing fields: logo, description, foundingDate.',
        'Add a sameAs array with every official URL: LinkedIn, Twitter/X, Wikipedia, Wikidata.',
        'Paste the schema into Google\'s Rich Results Test to verify it passes without errors.',
        'Deploy and re-run this audit to confirm the score improvement.',
      ],
      outcome: 'Estimated +8–14 pts · Increases LLM entity recognition by ~40%',
      snippet: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://yourbrand.com",
  "logo": "https://yourbrand.com/logo.png",
  "description": "One-sentence description of what you do.",
  "sameAs": [
    "https://linkedin.com/company/yourbrand",
    "https://twitter.com/yourbrand",
    "https://en.wikipedia.org/wiki/Your_Brand"
  ]
}`,
    },
    fail: {
      priority: 'critical', effort: 'low', effortValue: 1, impactValue: 3, timeEst: '1–2 hours',
      steps: [
        'Add the JSON-LD snippet below inside a <script type="application/ld+json"> tag in your homepage <head>.',
        'Fill in your real name, url, logo path, and description.',
        'Add every official profile URL to the sameAs array.',
        'Validate with Google\'s Rich Results Test before deploying.',
        'Extend the same pattern to key landing pages using Article schema.',
      ],
      outcome: 'Estimated +18–28 pts · Critical — without this, LLMs cannot reliably identify your brand as an entity',
      snippet: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://yourbrand.com",
  "logo": "https://yourbrand.com/logo.png",
  "description": "One-sentence description of what you do.",
  "foundingDate": "2015",
  "sameAs": [
    "https://linkedin.com/company/yourbrand",
    "https://twitter.com/yourbrand",
    "https://en.wikipedia.org/wiki/Your_Brand",
    "https://www.wikidata.org/wiki/Q_XXXXXXX"
  ]
}`,
    },
  },
  BRAND_AUTHORITY: {
    pass: 'Wikipedia presence confirmed. Keep the entry updated with fresh, cited information to maintain authority signals.',
    warning: {
      priority: 'high', effort: 'medium', effortValue: 2, impactValue: 3, timeEst: '1–2 weeks',
      steps: [
        'Log in to Wikipedia and locate your brand\'s existing entry.',
        'Add at least 3 new inline citations from tier-1 publications (Forbes, TechCrunch, Reuters, etc.).',
        'Expand the article with a Products/Services section and a History section.',
        'Pitch 2–3 guest articles or press releases to publications with high domain authority (DA 60+).',
        'Submit your brand to relevant industry directories: Crunchbase, G2, Clutch, industry-specific indexes.',
      ],
      outcome: 'Estimated +10–18 pts · Wikipedia citations are among the strongest authority signals for LLMs',
    },
    fail: {
      priority: 'critical', effort: 'high', effortValue: 3, impactValue: 3, timeEst: '4–8 weeks',
      steps: [
        'Check Wikipedia\'s notability guidelines for companies — ensure your brand qualifies.',
        'Gather at least 5 independent, reliable sources (news articles, analyst reports) that mention your brand.',
        'Draft a neutral, encyclopedic Wikipedia article. Avoid promotional language — it will be rejected.',
        'Simultaneously launch a PR campaign targeting 5+ tier-1 publications for brand mentions.',
        'Register your brand on Wikidata with structured entity data as a supplementary authority signal.',
        'Ensure Crunchbase, LinkedIn, and relevant industry directories have accurate, complete entries.',
      ],
      outcome: 'Estimated +20–35 pts · The single highest-impact authority action — LLMs heavily weight Wikipedia-linked entities',
    },
  },
  AUTHOR_SIGNALS: {
    pass: 'Author attribution is strong. Link all author profiles to LinkedIn and any published works to deepen the authority signal.',
    warning: {
      priority: 'medium', effort: 'low', effortValue: 1, impactValue: 2, timeEst: '4–6 hours',
      steps: [
        'Audit all published content — list every piece missing a named author byline.',
        'Add bylines to all articles: First Name Last Name, with a link to their author bio page.',
        'Enrich existing bio pages: add credentials, years of experience, areas of expertise, and a photo.',
        'Link each bio to the author\'s LinkedIn profile and any external publications.',
        'Add Person schema (JSON-LD) to each author bio page to make the entity machine-readable.',
      ],
      outcome: 'Estimated +6–10 pts · Named authorship increases LLM trust in content as an expert source',
      snippet: `{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Author Name",
  "jobTitle": "Senior Analyst",
  "url": "https://yourbrand.com/team/author-name",
  "sameAs": "https://linkedin.com/in/authorname"
}`,
    },
    fail: {
      priority: 'high', effort: 'medium', effortValue: 2, impactValue: 2, timeEst: '1–2 weeks',
      steps: [
        'Define your author roster: assign a named, real person to every existing and future content piece.',
        'Create individual author bio pages for each contributor at /team/[name] or /authors/[name].',
        'Each bio must include: full name, photo, job title, credentials, areas of expertise, LinkedIn link.',
        'Add bylines (with author bio links) to all existing articles — prioritise your top 20 traffic pages first.',
        'Implement Person schema JSON-LD on each bio page.',
        'Add Article schema to blog posts, including the "author" property pointing to the Person entity.',
      ],
      outcome: 'Estimated +12–18 pts · Anonymous content is systematically downweighted by LLMs as a citation source',
    },
  },
  CITATION_POTENTIAL: {
    pass: 'Original data assets detected. Create a dedicated Research hub for easy LLM discoverability and link it from your homepage.',
    warning: {
      priority: 'medium', effort: 'medium', effortValue: 2, impactValue: 2, timeEst: '1–2 weeks',
      steps: [
        'Audit existing data references — identify every statistic that lacks a clear methodology note.',
        'Add methodology sections to existing research content: sample size, data collection method, date range.',
        'Create a /research or /data page that aggregates all original data assets in one place.',
        'Add Dataset schema (JSON-LD) to pages containing original data.',
        'Plan and scope one proprietary study or benchmark report per quarter going forward.',
      ],
      outcome: 'Estimated +8–12 pts · Citable, methodologically sound data is the most durable GEO asset',
    },
    fail: {
      priority: 'high', effort: 'high', effortValue: 3, impactValue: 3, timeEst: '4–6 weeks',
      steps: [
        'Define 2–3 data angles relevant to your domain that no competitor currently owns.',
        'Run an original survey (SurveyMonkey, Typeform) with at least 200 respondents — publish the findings.',
        'Alternatively, compile and analyse publicly available data into a proprietary benchmark report.',
        'Write up findings as a long-form report with an executive summary, charts, and methodology section.',
        'Create a dedicated /research page and submit the report to industry publications for coverage.',
        'Add Dataset schema to the report page to make the data machine-readable for LLMs.',
      ],
      outcome: 'Estimated +15–22 pts · Original data transforms your brand from a content producer to a primary source',
    },
  },
  SEMANTIC_DEPTH: {
    pass: 'Semantic coverage is strong. Continue expanding into adjacent topic clusters via internal linking to solidify topical authority.',
    warning: {
      priority: 'medium', effort: 'medium', effortValue: 2, impactValue: 2, timeEst: '2–3 weeks',
      steps: [
        'Use a tool like Ahrefs, Semrush, or AlsoAsked to map all entities and sub-topics related to your core subject.',
        'Identify which related entities your site currently has no content for — these are your gaps.',
        'Create a content brief for each gap: 1 supporting article per missing sub-topic.',
        'Link every supporting article back to your main pillar page and to each other where relevant.',
        'Review your pillar page and add mentions of all related entities to increase co-occurrence signals.',
      ],
      outcome: 'Estimated +7–11 pts · LLMs favour sources that demonstrate comprehensive domain coverage',
    },
    fail: {
      priority: 'high', effort: 'high', effortValue: 3, impactValue: 3, timeEst: '6–8 weeks',
      steps: [
        'Map your full semantic neighborhood: list every concept, entity, and sub-topic in your domain.',
        'Audit existing content against this map — identify coverage gaps.',
        'Restructure your site architecture around topic clusters: 1 pillar page per core topic, 5–10 supporting pages per cluster.',
        'Rewrite your pillar pages to comprehensively cover the topic, not just rank for one keyword.',
        'Build internal links: every supporting page links to its pillar, and pillar pages link to all supporting pages.',
        'Add SpeakableSpecification schema to key definitions and explanations for LLM voice extraction.',
      ],
      outcome: 'Estimated +18–26 pts · Topical authority is the strongest long-term signal for LLM citation selection',
    },
  },
  DIRECT_ANSWER: {
    pass: 'FAQPage schema is live. Review answer length — keep each response under 60 words for optimal LLM extraction fidelity.',
    warning: {
      priority: 'high', effort: 'low', effortValue: 1, impactValue: 3, timeEst: '2–4 hours',
      steps: [
        'Identify all pages that already contain FAQ or Q&A content (even informal).',
        'Restructure each Q&A so questions are in H3 tags and answers are in the immediately following <p>.',
        'Add the FAQPage JSON-LD snippet below to every page with Q&A content.',
        'Keep each answer between 40–80 words — concise, direct, and self-contained.',
        'Validate with Google\'s Rich Results Test before deploying.',
      ],
      outcome: 'Estimated +10–16 pts · FAQPage schema is the #1 highest ROI technical fix for LLM direct-answer extraction',
      snippet: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [your topic]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Concise answer in 40–80 words. Self-contained. No jargon."
      }
    }
  ]
}`,
    },
    fail: {
      priority: 'critical', effort: 'low', effortValue: 1, impactValue: 3, timeEst: '3–5 hours',
      steps: [
        'Identify the top 10 questions your customers ask about your product/service/industry.',
        'Add a FAQ section to your homepage and top 5 content pages using H3 tags for questions.',
        'Write concise, self-contained answers: 40–80 words each, no jargon, no promotional language.',
        'Add the FAQPage JSON-LD schema to each page that has Q&A content.',
        'Validate all schema with Google\'s Rich Results Test before publishing.',
        'Plan a Definitions or Glossary section for your domain — these are prime LLM citation targets.',
      ],
      outcome: 'Estimated +16–24 pts · Direct-answer format is the single fastest way to enter AI-generated responses',
      snippet: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [your core topic]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A clear, jargon-free answer in 40–80 words."
      }
    },
    {
      "@type": "Question",
      "name": "How does [your product/service] work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A concise process description in 40–80 words."
      }
    }
  ]
}`,
    },
  },
  CONTENT_FRESHNESS: {
    pass: 'Content freshness signals are strong. Maintain a quarterly update cycle on evergreen pages to sustain this signal.',
    warning: {
      priority: 'low', effort: 'low', effortValue: 1, impactValue: 1, timeEst: '1–2 hours',
      steps: [
        'Configure your web server or CMS to send the Last-Modified HTTP header on all pages.',
        'Add a visible "Last updated: [date]" note to the top or bottom of all content pages.',
        'Audit content older than 90 days — update statistics, add new examples, refresh any outdated information.',
        'Add dateModified to your Article JSON-LD schema and keep it updated on every content refresh.',
      ],
      outcome: 'Estimated +5–8 pts · Freshness signals prevent LLMs from deprioritising your content as stale',
      snippet: `{
  "@type": "Article",
  "datePublished": "2024-01-15",
  "dateModified": "2025-03-20"
}`,
    },
    fail: {
      priority: 'medium', effort: 'low', effortValue: 1, impactValue: 2, timeEst: '2–4 hours',
      steps: [
        'Check your server configuration — add Last-Modified headers in Apache (.htaccess) or Nginx config.',
        'In your CMS, enable automatic dateModified updates whenever a post is edited.',
        'Add a visible "Updated [Month Year]" stamp to all long-form content pages.',
        'Set up a recurring quarterly audit: review and update your top 20 pages by traffic.',
        'Add datePublished and dateModified fields to all Article schema implementations.',
      ],
      outcome: 'Estimated +10–14 pts · Stale content without freshness signals is systematically downweighted in LLM retrieval',
      snippet: `# Apache .htaccess
Header set Cache-Control "public, must-revalidate"
# Nginx equivalent
add_header Last-Modified $date_gmt;`,
    },
  },
  TONE_ALIGNMENT: {
    pass: 'Tone is well-calibrated for expert queries. Document your voice guidelines for new contributors.',
    warning: {
      priority: 'low', effort: 'medium', effortValue: 2, impactValue: 1, timeEst: '1–2 weeks',
      steps: [
        'Audit your top 10 content pages — flag sections that read as promotional rather than informative.',
        'Rewrite flagged sections: replace "we offer the best" with factual, evidence-based claims.',
        'Draft a 1-page editorial style guide: tone (authoritative, not promotional), vocabulary, sentence length.',
        'Brief all content contributors on the guide before their next piece.',
        'Use the guide as a checklist before publishing: every piece should pass the "would a professor cite this?" test.',
      ],
      outcome: 'Estimated +4–7 pts · Promotional tone is a disqualifying signal for LLM citation',
    },
    fail: {
      priority: 'medium', effort: 'high', effortValue: 3, impactValue: 2, timeEst: '3–4 weeks',
      steps: [
        'Conduct a full tone audit across all content — categorise each page as informative, mixed, or promotional.',
        'Prioritise rewriting your top 20 traffic pages: convert promotional claims to evidence-based statements.',
        'Create a clear editorial style guide covering: tone of voice, vocabulary dos/don\'ts, citation standards.',
        'Establish a peer-review process: no content publishes without a tone check against the style guide.',
        'Consider restructuring product pages to separate informational content from commercial CTAs.',
      ],
      outcome: 'Estimated +10–15 pts · Authoritative, informative tone is non-negotiable for AI citation',
    },
  },
  STRUCTURED_DATA: {
    pass: 'Schema implementation is comprehensive. Run Google\'s Rich Results Test quarterly and extend to new content types as you publish them.',
    warning: {
      priority: 'high', effort: 'low', effortValue: 1, impactValue: 3, timeEst: '3–5 hours',
      steps: [
        'Paste your current schema into Google\'s Rich Results Test — note every error and warning.',
        'Fix all missing required fields first: these are the most damaging to score accuracy.',
        'Expand coverage: add Article schema to all blog posts if not already present.',
        'Add FAQ schema to any page with Q&A content.',
        'Re-validate after each fix and re-run this audit to confirm score improvement.',
      ],
      outcome: 'Estimated +9–15 pts · Schema errors silently block LLM extraction — fixing them is zero-creativity, high-return work',
      snippet: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2025-01-01",
  "dateModified": "2025-03-01",
  "publisher": {
    "@type": "Organization",
    "name": "Your Brand",
    "logo": { "@type": "ImageObject", "url": "https://yourbrand.com/logo.png" }
  }
}`,
    },
    fail: {
      priority: 'critical', effort: 'low', effortValue: 1, impactValue: 3, timeEst: '4–6 hours',
      steps: [
        'Add Organization schema to your homepage — this is the most critical first step.',
        'Add Article schema to all blog posts and long-form content pages.',
        'Add FAQPage schema to any page with Q&A content.',
        'Add BreadcrumbList schema to improve hierarchical context for LLMs.',
        'Validate every implementation with Google\'s Rich Results Test before deploying.',
        'Set up a schema monitoring checklist: every new content type gets appropriate schema on launch.',
      ],
      outcome: 'Estimated +20–30 pts · Structured data is the primary channel through which LLMs parse your content at scale',
      snippet: `<!-- Homepage <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://yourbrand.com",
  "logo": "https://yourbrand.com/logo.png",
  "description": "What you do in one sentence.",
  "sameAs": ["https://linkedin.com/company/yourbrand"]
}
</script>`,
    },
  },
  LLMS_TXT: {
    pass: '/llms.txt is live and well-structured. Review quarterly as the LLM crawling landscape evolves.',
    warning: {
      priority: 'medium', effort: 'low', effortValue: 1, impactValue: 2, timeEst: '30–60 min',
      steps: [
        'Open your existing /llms.txt and review its current content.',
        'Add explicit Allow/Disallow directives for the content sections you want LLMs to index.',
        'Add a preferred citation format block: how you want your brand referenced when cited.',
        'Add a licensing contact field: email or URL for AI licensing inquiries.',
        'Add a "# Key content" section listing your most important pages for LLM indexing.',
      ],
      outcome: 'Estimated +8–12 pts · A complete llms.txt signals AI-readiness and increases likelihood of systematic indexing',
      snippet: `# llms.txt — AI Agent Permissions
# https://llmstxt.org

## Permissions
Allow: /blog
Allow: /research
Allow: /docs
Disallow: /admin

## Citation
Preferred-Citation: Brand Name (yourbrand.com)
License-Contact: ai-licensing@yourbrand.com

## Key Content
- https://yourbrand.com/about
- https://yourbrand.com/research`,
    },
    fail: {
      priority: 'high', effort: 'low', effortValue: 1, impactValue: 2, timeEst: '20–30 min',
      steps: [
        'Create a plain text file named llms.txt and place it at your domain root (/llms.txt).',
        'Add permission directives: which sections AI agents may and may not index.',
        'Add your preferred citation format and an AI licensing contact.',
        'List your most important URLs under a Key Content section.',
        'Test accessibility: open https://yourdomain.com/llms.txt in a browser — it should load as plain text.',
      ],
      outcome: 'Estimated +12–18 pts · The fastest, easiest GEO fix available — takes 20 minutes and signals immediate AI-readiness',
      snippet: `# llms.txt — AI Agent Permissions
# https://llmstxt.org

## Permissions
Allow: /
Disallow: /admin
Disallow: /private

## Citation
Preferred-Citation: Your Brand Name (yourbrand.com)
License-Contact: ai@yourbrand.com

## Key Content
- https://yourbrand.com/about
- https://yourbrand.com/blog
- https://yourbrand.com/research`,
    },
  },
  SEMANTIC_HTML: {
    pass: 'HTML structure is clean. Run periodic Lighthouse audits to catch heading hierarchy regressions.',
    warning: {
      priority: 'medium', effort: 'low', effortValue: 1, impactValue: 2, timeEst: '2–4 hours',
      steps: [
        'Run Lighthouse (DevTools → Lighthouse → SEO) on your top 10 pages — note all heading-order warnings.',
        'Fix any pages with multiple H1 tags: each page must have exactly one H1.',
        'Ensure H2s are direct children of H1 context, H3s nest under H2s — no skipped levels.',
        'Replace semantic no-ops (styled divs used as headers) with proper heading tags.',
        'Replace <div class="nav"> with <nav>, <div class="main"> with <main>, <div class="article"> with <article>.',
      ],
      outcome: 'Estimated +5–9 pts · Correct heading hierarchy is the primary structural signal LLMs use to parse content priority',
    },
    fail: {
      priority: 'high', effort: 'medium', effortValue: 2, impactValue: 2, timeEst: '1–2 days',
      steps: [
        'Run a full site crawl (Screaming Frog or Sitebulb) — export the heading structure report.',
        'Fix all pages with missing H1s: every page needs exactly one H1 that matches the page\'s primary topic.',
        'Restructure all heading hierarchies to be sequential: H1 → H2 → H3, no skipped levels.',
        'Replace all presentational divs with semantic HTML5 elements: header, main, article, section, aside, footer, nav.',
        'Remove any inline styles from heading tags — headings should be structural, not decorative.',
        'Re-audit with Lighthouse after fixes to confirm resolution.',
      ],
      outcome: 'Estimated +10–16 pts · Broken heading hierarchy actively confuses LLM content parsing',
    },
  },
  CONTENT_MATCH: {
    pass: 'Title and meta alignment is tight. Review new content before publishing — keep titles under 60 chars and meta under 160.',
    warning: {
      priority: 'low', effort: 'low', effortValue: 1, impactValue: 1, timeEst: '1–3 hours',
      steps: [
        'Export all page titles and meta descriptions using a crawl tool or your CMS.',
        'Identify mismatches: titles that don\'t reflect the actual page content, or meta descriptions that are generic.',
        'Rewrite mismatched titles to accurately describe the page in under 60 characters.',
        'Rewrite mismatched meta descriptions to summarise the page in 140–160 characters.',
        'Remove keyword stuffing from both fields — prioritise clarity over density.',
      ],
      outcome: 'Estimated +4–7 pts · Title/content alignment is a lightweight fix with compounding benefits',
    },
    fail: {
      priority: 'medium', effort: 'low', effortValue: 1, impactValue: 2, timeEst: '4–6 hours',
      steps: [
        'Run a full title and meta audit via Screaming Frog or your CMS\'s built-in SEO tools.',
        'Flag all pages where the title does not accurately describe the content.',
        'Rewrite flagged titles: accurate, descriptive, under 60 characters, no keyword stuffing.',
        'Rewrite all missing or generic meta descriptions: summarise the page value in 140–160 chars.',
        'Establish a pre-publish checklist that includes title/meta review for every new piece of content.',
      ],
      outcome: 'Estimated +8–14 pts · Mismatched titles confuse LLMs about page intent — alignment is a prerequisite for accurate citation',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type Status = 'PASS' | 'WARNING' | 'FAIL';
type Mode = 'analyze' | 'compare';
type Lang = 'ENG' | 'ESP';
type ResultView = 'diagnostics' | 'plan';

interface ParamResult {
  key: string;
  score: number;
  status: Status;
  finding: string;
  isLive?: boolean;
}

interface HistoryEntry {
  id: string;
  url: string;
  date: string;
  overall: number;
  sector: string;
}

interface PrioritizedAction {
  param: typeof PARAMETERS[0];
  result: ParamResult;
  detail: ActionDetail;
  priorityScore: number;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getStatus(score: number): Status {
  if (score >= 70) return 'PASS';
  if (score >= 40) return 'WARNING';
  return 'FAIL';
}

function randomScore(base: number): number {
  return Math.min(100, Math.max(0, Math.round(base + (Math.random() - 0.5) * 22)));
}

function jitter(val: number, range = 8): number {
  return Math.min(100, Math.max(0, Math.round(val + (Math.random() - 0.5) * range)));
}

function computeOverall(results: Record<string, ParamResult>): number {
  let total = 0, weights = 0;
  PARAMETERS.forEach(p => { total += results[p.key].score * p.weight; weights += p.weight; });
  return Math.round(total / weights);
}

function groupScore(results: Record<string, ParamResult>, groupKey: string): number {
  const items = PARAMETERS.filter(p => p.group === groupKey);
  const total = items.reduce((acc, p) => acc + results[p.key].score * p.weight, 0);
  const weights = items.reduce((acc, p) => acc + p.weight, 0);
  return Math.round(total / weights);
}

function statusColor(status: Status): string {
  return status === 'PASS' ? '#16a34a' : status === 'WARNING' ? '#d97706' : '#dc2626';
}

function scoreColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}

function scoreLabel(score: number): string {
  if (score >= 71) return 'GEO READY';
  if (score >= 41) return 'NEEDS WORK';
  return 'NOT READY';
}

function getSummary(score: number, url: string): string {
  if (score >= 71) return `${url} shows strong GEO readiness. Entity clarity and structured data give LLMs the signals needed to cite this source confidently.`;
  if (score >= 41) return `${url} has a partial GEO foundation. Structured data and LLM directives are the priority — without them, generative engines can't reliably cite this source.`;
  return `${url} is not optimized for generative engine visibility. Critical gaps in entity definition and technical markup are blocking AI citation at scale.`;
}

function shortUrl(url: string): string {
  return url.replace('https://', '').replace('http://', '').split('/')[0];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function brandName(url: string): string {
  const host = shortUrl(url);
  return host.replace(/\.(com|org|net|io|co|es|uk|de|fr)$/, '').replace(/^www\./, '');
}

// ═══════════════════════════════════════════════════════════════════
// ACTION PLAN HELPERS
// ═══════════════════════════════════════════════════════════════════

function getPriorityScore(param: typeof PARAMETERS[0], result: ParamResult, detail: ActionDetail): number {
  const statusMultiplier = result.status === 'FAIL' ? 2 : 1;
  return (param.weight * detail.impactValue * statusMultiplier) / detail.effortValue;
}

function getPrioritizedActions(results: Record<string, ParamResult>): PrioritizedAction[] {
  const items: PrioritizedAction[] = [];
  PARAMETERS.forEach(param => {
    const result = results[param.key];
    if (result.status === 'PASS') return;
    const actionDef = ACTIONS[param.key];
    if (!actionDef) return;
    const detail = result.status === 'FAIL' ? actionDef.fail : actionDef.warning;
    const priorityScore = getPriorityScore(param, result, detail);
    items.push({ param, result, detail, priorityScore });
  });
  return items.sort((a, b) => b.priorityScore - a.priorityScore);
}

function getQuickWins(actions: PrioritizedAction[]): PrioritizedAction[] {
  return actions.filter(a => a.detail.effortValue === 1 && a.detail.impactValue >= 2).slice(0, 3);
}

function priorityLabel(level: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return map[level];
}

function effortLabel(level: EffortLevel): string {
  const map: Record<EffortLevel, string> = { low: 'Low effort', medium: 'Medium effort', high: 'High effort' };
  return map[level];
}

// ═══════════════════════════════════════════════════════════════════
// REAL DATA FETCHERS
// ═══════════════════════════════════════════════════════════════════

async function fetchPageSpeedData(url: string): Promise<Partial<Record<string, number>>> {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop&category=SEO`;
    const res = await fetch(apiUrl);
    if (!res.ok) return {};
    const data = await res.json();
    const audits = data.lighthouseResult?.audits;
    if (!audits) return {};
    const overrides: Partial<Record<string, number>> = {};
    const seoScore = data.lighthouseResult?.categories?.seo?.score;
    if (seoScore !== undefined) overrides.STRUCTURED_DATA = jitter(Math.round(seoScore * 90), 8);
    const headingAudit = audits['heading-order'];
    if (headingAudit?.score !== undefined && headingAudit.score !== null)
      overrides.SEMANTIC_HTML = headingAudit.score === 1 ? jitter(80) : jitter(32);
    const titleAudit = audits['document-title'];
    const metaAudit = audits['meta-description'];
    if (titleAudit?.score !== undefined && metaAudit?.score !== undefined) {
      const avg = ((titleAudit.score || 0) + (metaAudit.score || 0)) / 2;
      overrides.CONTENT_MATCH = jitter(Math.round(avg * 88), 8);
    }
    const sdAudit = audits['structured-data'];
    if (sdAudit !== undefined) {
      if (sdAudit.score === 1) overrides.ENTITY_CLARITY = jitter(82);
      else if (sdAudit.score === 0) overrides.ENTITY_CLARITY = jitter(28);
      else overrides.ENTITY_CLARITY = jitter(50);
    }
    const sdItems = sdAudit?.details?.items || [];
    const hasFAQ = JSON.stringify(sdItems).toLowerCase().includes('faq');
    overrides.DIRECT_ANSWER = hasFAQ ? jitter(82) : jitter(22);
    return overrides;
  } catch { return {}; }
}

async function fetchWikipediaAuthority(url: string): Promise<Partial<Record<string, number>>> {
  try {
    const brand = brandName(url);
    if (!brand || brand.length < 2) return {};
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(brand)}&format=json&origin=*&srlimit=3`;
    const res = await fetch(apiUrl);
    if (!res.ok) return {};
    const data = await res.json();
    const results = data.query?.search || [];
    if (results.length === 0) return { BRAND_AUTHORITY: jitter(20) };
    const topResult = results[0];
    const titleMatch = topResult.title.toLowerCase().includes(brand.toLowerCase());
    if (titleMatch) return { BRAND_AUTHORITY: jitter(85) };
    const partialMatch = results.some((r: any) => r.title.toLowerCase().includes(brand.toLowerCase()));
    if (partialMatch) return { BRAND_AUTHORITY: jitter(62) };
    return { BRAND_AUTHORITY: jitter(38) };
  } catch { return {}; }
}

async function fetchLLMSTxt(url: string): Promise<Partial<Record<string, number>>> {
  try {
    const origin = new URL(url.startsWith('http') ? url : `https://${url}`).origin;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(origin + '/llms.txt')}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return { LLMS_TXT: jitter(10) };
    const data = await res.json();
    if (data.status?.http_code === 404 || !data.contents) return { LLMS_TXT: jitter(10) };
    const content = data.contents as string;
    if (content.length < 20) return { LLMS_TXT: jitter(30) };
    const hasPermissions = content.toLowerCase().includes('allow') || content.toLowerCase().includes('disallow');
    const hasCitation = content.toLowerCase().includes('cite') || content.toLowerCase().includes('attribution');
    if (hasPermissions && hasCitation) return { LLMS_TXT: jitter(90) };
    if (hasPermissions || hasCitation) return { LLMS_TXT: jitter(65) };
    return { LLMS_TXT: jitter(45) };
  } catch { return { LLMS_TXT: jitter(10) }; }
}

async function fetchContentFreshness(url: string): Promise<Partial<Record<string, number>>> {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return {};
    const data = await res.json();
    const lastModified = data.status?.last_modified || data.headers?.['last-modified'];
    if (!lastModified) return { CONTENT_FRESHNESS: jitter(25) };
    const modDate = new Date(lastModified);
    const now = new Date();
    const daysDiff = (now.getTime() - modDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < 30)  return { CONTENT_FRESHNESS: jitter(92) };
    if (daysDiff < 90)  return { CONTENT_FRESHNESS: jitter(75) };
    if (daysDiff < 180) return { CONTENT_FRESHNESS: jitter(55) };
    if (daysDiff < 365) return { CONTENT_FRESHNESS: jitter(38) };
    return { CONTENT_FRESHNESS: jitter(18) };
  } catch { return {}; }
}

async function fetchAllRealData(url: string): Promise<Partial<Record<string, number>>> {
  const [pagespeed, wikipedia, llmstxt, freshness] = await Promise.allSettled([
    fetchPageSpeedData(url), fetchWikipediaAuthority(url), fetchLLMSTxt(url), fetchContentFreshness(url),
  ]);
  return {
    ...(pagespeed.status === 'fulfilled' ? pagespeed.value : {}),
    ...(wikipedia.status === 'fulfilled' ? wikipedia.value : {}),
    ...(llmstxt.status === 'fulfilled' ? llmstxt.value : {}),
    ...(freshness.status === 'fulfilled' ? freshness.value : {}),
  };
}

function generateResults(liveOverrides?: Partial<Record<string, number>>): Record<string, ParamResult> {
  const bases: Record<string, number> = {
    ENTITY_CLARITY: 62, BRAND_AUTHORITY: 45, AUTHOR_SIGNALS: 38, CITATION_POTENTIAL: 55,
    SEMANTIC_DEPTH: 70, DIRECT_ANSWER: 42, CONTENT_FRESHNESS: 78, TONE_ALIGNMENT: 65,
    STRUCTURED_DATA: 28, LLMS_TXT: 15, SEMANTIC_HTML: 72, CONTENT_MATCH: 60,
  };
  const results: Record<string, ParamResult> = {};
  for (const key of Object.keys(bases)) {
    const isLive = liveOverrides?.[key] !== undefined;
    const score = isLive ? liveOverrides![key]! : randomScore(bases[key]);
    const status = getStatus(score);
    const pool = FINDINGS[key][status.toLowerCase() as 'pass' | 'warning' | 'fail'];
    results[key] = { key, score, status, finding: pool[Math.floor(Math.random() * pool.length)], isLive };
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function LLMSelector({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const allSelected = selected.length === LLMS.length;
  const toggleAll = () => onChange(allSelected ? [] : LLMS.map(l => l.key));
  const toggle = (key: string) => onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  return (
    <div className="llm-selector">
      <div className="llm-selector-header">
        <span className="llm-selector-label">Evaluate visibility on</span>
        <button className="llm-toggle-all" onClick={toggleAll}>{allSelected ? 'Deselect all' : 'Select all'}</button>
      </div>
      <div className="llm-pills">
        {LLMS.map(llm => (
          <button key={llm.key} className={`llm-pill ${selected.includes(llm.key) ? 'active' : ''}`} onClick={() => toggle(llm.key)}>
            <span className="llm-icon">{llm.icon}</span>{llm.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShareDropdown({ url, score, onClose }: { url: string; score: number; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}?url=${encodeURIComponent(url)}&score=${score}`;
  const handleOption = (key: string) => {
    if (key === 'copy') { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => { setCopied(false); onClose(); }, 1500); }
    else if (key === 'email') { window.open(`mailto:?subject=GEO Score Report: ${shortUrl(url)}&body=Check this GEO readiness report: ${shareUrl}`); onClose(); }
    else if (key === 'teams') { window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(shareUrl)}`); onClose(); }
    else if (key === 'slack') { window.open(`https://slack.com/`); onClose(); }
  };
  return (
    <motion.div className="share-dropdown" initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}>
      <p className="share-dropdown-title">Share report</p>
      {SHARE_OPTIONS.map(opt => (
        <button key={opt.key} className="share-option" onClick={() => handleOption(opt.key)}>
          <span className="share-icon">{opt.icon}</span>
          {opt.key === 'copy' && copied ? 'Copied!' : opt.label}
        </button>
      ))}
    </motion.div>
  );
}

function RadarChart({ results, benchmarks, sector }: { results: Record<string, ParamResult>; benchmarks?: Record<string, number>; sector: string }) {
  const cx = 120, cy = 110, r = 80;
  const angles = GROUPS.map((_, i) => (i * 2 * Math.PI / GROUPS.length) - Math.PI / 2);
  const scores = GROUPS.map(g => groupScore(results, g.key) / 100);
  const benchScores = benchmarks ? GROUPS.map(g => {
    const items = PARAMETERS.filter(p => p.group === g.key);
    const total = items.reduce((acc, p) => acc + (benchmarks[p.key] || 0) * p.weight, 0);
    const weights = items.reduce((acc, p) => acc + p.weight, 0);
    return (total / weights) / 100;
  }) : null;
  const toPoint = (angle: number, ratio: number) => ({ x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) });
  const toPolygon = (pts: { x: number; y: number }[]) => pts.map(p => `${p.x},${p.y}`).join(' ');
  const scorePoints = scores.map((s, i) => toPoint(angles[i], s));
  const benchPoints = benchScores ? benchScores.map((s, i) => toPoint(angles[i], s)) : null;
  return (
    <div className="radar-wrap">
      <p className="radar-title">Dimension Overview {sector && <span className="radar-sector">vs {sector} avg</span>}</p>
      <svg width="240" height="220" viewBox="0 0 240 220">
        {[0.25, 0.5, 0.75, 1].map((ratio, gi) => (
          <polygon key={gi} points={toPolygon(angles.map(a => toPoint(a, ratio)))} fill="none" stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {angles.map((a, i) => { const end = toPoint(a, 1); return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />; })}
        {benchPoints && <polygon points={toPolygon(benchPoints)} fill="rgba(46,105,255,0.07)" stroke="#2E69FF" strokeWidth="1.5" strokeDasharray="4 3" />}
        <polygon points={toPolygon(scorePoints)} fill="rgba(22,163,74,0.12)" stroke="#16a34a" strokeWidth="2" />
        {scorePoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={scoreColor(scores[i] * 100)} />)}
        {GROUPS.map((g, i) => {
          const lx = cx + (r + 18) * Math.cos(angles[i]);
          const ly = cy + (r + 18) * Math.sin(angles[i]);
          const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle';
          return <text key={i} x={lx} y={ly + 4} textAnchor={anchor} fontSize="10" fill="#64748b" fontFamily="system-ui">{g.label}</text>;
        })}
        {scorePoints.map((p, i) => (
          <text key={i} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="600" fill={scoreColor(scores[i] * 100)} fontFamily="monospace">
            {Math.round(scores[i] * 100)}
          </text>
        ))}
      </svg>
      {benchPoints && (
        <div className="radar-legend">
          <span className="radar-legend-score">■ Your score</span>
          <span className="radar-legend-bench">╌ {sector} avg</span>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 44, circ = 2 * Math.PI * r, color = scoreColor(score);
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <motion.circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
      <text x="55" y="51" textAnchor="middle" fontSize="22" fontWeight="700" fill={color} fontFamily="monospace">{score}</text>
      <text x="55" y="65" textAnchor="middle" fontSize="8.5" fill="#9ca3af" fontFamily="monospace" letterSpacing="1">{scoreLabel(score)}</text>
    </svg>
  );
}

function ParamRow({ param, result, compareResult, mainLabel, compareLabel, benchmark }: {
  param: typeof PARAMETERS[0]; result: ParamResult; compareResult?: ParamResult;
  mainLabel?: string; compareLabel?: string; benchmark?: number;
}) {
  const [recOpen, setRecOpen] = useState(false);
  const delta = compareResult ? result.score - compareResult.score : null;
  const rec = RECOMMENDATIONS[param.key];
  const recText = rec ? rec[result.status.toLowerCase() as 'pass' | 'warning' | 'fail'] : null;
  return (
    <div className="param-row">
      <div className="param-row-header">
        <div className="param-label-group">
          <span className="param-label">{param.label}</span>
          {result.isLive && <span className="live-badge">LIVE</span>}
        </div>
        <div className="param-row-scores">
          {delta !== null && (
            <span className="param-delta" style={{ color: delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#9ca3af' }}>
              {delta > 0 ? `+${delta}` : delta === 0 ? '—' : delta}
            </span>
          )}
          <span className="param-badge" style={{ color: statusColor(result.status), borderColor: statusColor(result.status) }}>{result.status}</span>
        </div>
      </div>
      <div className="dual-bar-row">
        <span className="dual-bar-label">{mainLabel || 'A'}</span>
        <div className="param-bar-track">
          <motion.div className="param-bar-fill" initial={{ width: 0 }} animate={{ width: `${result.score}%` }} transition={{ duration: 0.8 }} style={{ backgroundColor: scoreColor(result.score) }} />
          {benchmark !== undefined && <div className="benchmark-marker" style={{ left: `${benchmark}%` }} />}
        </div>
        <span className="dual-bar-score" style={{ color: scoreColor(result.score) }}>{result.score}</span>
      </div>
      {compareResult && (
        <div className="dual-bar-row">
          <span className="dual-bar-label secondary">{compareLabel || 'B'}</span>
          <div className="param-bar-track">
            <motion.div className="param-bar-fill" initial={{ width: 0 }} animate={{ width: `${compareResult.score}%` }} transition={{ duration: 0.8, delay: 0.1 }} style={{ backgroundColor: scoreColor(compareResult.score) }} />
          </div>
          <span className="dual-bar-score" style={{ color: scoreColor(compareResult.score) }}>{compareResult.score}</span>
        </div>
      )}
      <p className="param-finding">↳ {result.finding}</p>
      {compareResult && <p className="param-finding secondary">↳ {compareResult.finding}</p>}
      {recText && result.status !== 'PASS' && (
        <button className="rec-toggle" onClick={() => setRecOpen(o => !o)}>
          {recOpen ? '↑ Hide recommendation' : '↓ How to fix this'}
        </button>
      )}
      <AnimatePresence>
        {recOpen && recText && (
          <motion.div className="rec-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            <p>{recText}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UrgencyBlock({ score, sector, url }: { score?: number; sector: string; url?: string }) {
  const stats: Record<string, { pct: string; mult: string }> = {
    'Technology': { pct: '42%', mult: '3.8x' }, 'Retail & E-commerce': { pct: '31%', mult: '2.9x' },
    'Finance & Banking': { pct: '38%', mult: '4.1x' }, 'Healthcare': { pct: '45%', mult: '4.5x' },
    'Media & Publishing': { pct: '52%', mult: '3.2x' }, 'B2B Services': { pct: '29%', mult: '3.0x' },
  };
  const s = stats[sector] || { pct: '38%', mult: '3.5x' };
  const brand = url ? shortUrl(url) : 'your brand';
  let tone: 'green' | 'amber' | 'red' | 'neutral' = 'neutral';
  let message = `In the ${sector} sector, ${s.pct} of informational queries are now resolved by AI without a click. Brands with GEO scores above 70 capture ${s.mult} more AI-attributed traffic than those below 40.`;
  if (score !== undefined) {
    if (score >= 70) { tone = 'green'; message = `With a score of ${score}, ${brand} is within the citation radius of major LLMs. Brands in this range capture ${s.mult} more AI-attributed traffic. Keep the momentum.`; }
    else if (score >= 40) { tone = 'amber'; message = `With a score of ${score}, ${brand} is on the boundary. In ${sector}, ${s.pct} of queries are resolved by AI without a click. Closing the gap to 70+ could unlock ${s.mult} more AI-driven visibility.`; }
    else { tone = 'red'; message = `With a score of ${score}, ${brand} is outside the citation radius of major LLMs. In ${sector}, ${s.pct} of queries are already answered by AI — your brand is invisible to that traffic.`; }
  }
  return (
    <div className={`urgency-block urgency-${tone}`}>
      <span className="urgency-icon">⚡</span>
      <p className="urgency-text">{message}</p>
    </div>
  );
}

function BadgeModal({ score, url, onClose }: { score: number; url: string; onClose: () => void }) {
  const color = scoreColor(score);
  const label = scoreLabel(score);
  const [copied, setCopied] = useState(false);
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="56" viewBox="0 0 200 56"><rect width="200" height="56" rx="6" fill="#0f172a"/><rect x="1" y="1" width="198" height="54" rx="5" fill="none" stroke="${color}" stroke-width="1.5"/><text x="16" y="22" font-family="monospace" font-size="9" fill="#94a3b8" letter-spacing="1">GEO SCORE</text><text x="16" y="44" font-family="monospace" font-size="24" font-weight="700" fill="${color}">${score}</text><text x="184" y="22" font-family="monospace" font-size="8" fill="#334155" text-anchor="end">${label}</text><text x="184" y="46" font-family="monospace" font-size="8" fill="#475569" text-anchor="end">geo-scorer.vercel.app</text></svg>`;
  const encoded = btoa(unescape(encodeURIComponent(svgContent)));
  const dataUrl = `data:image/svg+xml;base64,${encoded}`;
  const htmlCode = `<img src="${dataUrl}" alt="GEO Score: ${score}" width="200" height="56" />`;
  const handleCopy = () => { navigator.clipboard.writeText(htmlCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">GEO Score Badge</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-sub">Embed this badge on your site to showcase your GEO readiness score.</p>
        <div className="badge-preview"><img src={dataUrl} alt="Badge preview" width="200" height="56" /></div>
        <div className="badge-code">{htmlCode}</div>
        <button className="copy-btn" onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy HTML'}</button>
      </motion.div>
    </motion.div>
  );
}

function HistoryPanel({ history, onClose, onSelect }: { history: HistoryEntry[]; onClose: () => void; onSelect: (e: HistoryEntry) => void }) {
  return (
    <motion.div className="history-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
      <div className="history-header">
        <span className="history-title">Analysis History</span>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      {history.length === 0
        ? <p className="history-empty">No analyses yet. Run your first scan above.</p>
        : <div className="history-list">
            {history.map(entry => (
              <div key={entry.id} className="history-entry" onClick={() => { onSelect(entry); onClose(); }}>
                <div className="history-entry-left">
                  <span className="history-url">{shortUrl(entry.url)}</span>
                  <span className="history-meta">{entry.sector} · {formatDate(entry.date)}</span>
                </div>
                <span className="history-score" style={{ color: scoreColor(entry.overall) }}>{entry.overall}</span>
              </div>
            ))}
          </div>
      }
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACTION PLAN COMPONENTS  (Step 2)
// ═══════════════════════════════════════════════════════════════════

function QuickWinCard({ action, index }: { action: PrioritizedAction; index: number }) {
  const [open, setOpen] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const copySnippet = () => {
    if (!action.detail.snippet) return;
    navigator.clipboard.writeText(action.detail.snippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };
  return (
    <motion.div className="quick-win-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <div className="qw-header" onClick={() => setOpen(o => !o)}>
        <div className="qw-left">
          <span className="qw-index">#{index + 1}</span>
          <div className="qw-meta">
            <span className="qw-label">{action.param.label}</span>
            <span className="qw-time">⏱ {action.detail.timeEst}</span>
          </div>
        </div>
        <div className="qw-right">
          <span className={`qw-status-badge status-${action.result.status.toLowerCase()}`}>{action.result.status}</span>
          <span className="qw-score" style={{ color: scoreColor(action.result.score) }}>{action.result.score}</span>
          <span className="qw-chevron">{open ? '↑' : '↓'}</span>
        </div>
      </div>
      <p className="qw-outcome">→ {action.detail.outcome}</p>
      <AnimatePresence>
        {open && (
          <motion.div className="qw-body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
            <ol className="action-steps-list">
              {action.detail.steps.map((step, i) => (
                <li key={i} className="action-step-item">
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
            {action.detail.snippet && (
              <div className="snippet-block">
                <div className="snippet-header">
                  <span className="snippet-label">Code snippet</span>
                  <button className="snippet-copy" onClick={copySnippet}>{snippetCopied ? '✓ Copied' : '⎘ Copy'}</button>
                </div>
                <pre className="snippet-pre"><code>{action.detail.snippet}</code></pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActionCard({ action, rank }: { action: PrioritizedAction; rank: number }) {
  const [open, setOpen] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const copySnippet = () => {
    if (!action.detail.snippet) return;
    navigator.clipboard.writeText(action.detail.snippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };
  const priorityColors: Record<PriorityLevel, string> = { critical: '#dc2626', high: '#d97706', medium: '#2563eb', low: '#64748b' };
  const effortColors: Record<EffortLevel, string> = { low: '#16a34a', medium: '#d97706', high: '#dc2626' };
  return (
    <div className={`action-card ${open ? 'open' : ''}`}>
      <div className="action-card-header" onClick={() => setOpen(o => !o)}>
        <div className="action-card-left">
          <span className="action-rank">#{rank}</span>
          <div className="action-card-meta">
            <span className="action-param-label">{action.param.label}</span>
            <div className="action-badges">
              <span className="action-badge" style={{ color: priorityColors[action.detail.priority], borderColor: priorityColors[action.detail.priority] }}>{priorityLabel(action.detail.priority)}</span>
              <span className="action-badge effort" style={{ color: effortColors[action.detail.effort], borderColor: effortColors[action.detail.effort] }}>{effortLabel(action.detail.effort)}</span>
              <span className="action-time-est">⏱ {action.detail.timeEst}</span>
            </div>
          </div>
        </div>
        <div className="action-card-right">
          <span className={`action-status-tag status-${action.result.status.toLowerCase()}`}>{action.result.status}</span>
          <span className="action-score" style={{ color: scoreColor(action.result.score) }}>{action.result.score}</span>
          <span className="action-chevron">{open ? '↑' : '↓'}</span>
        </div>
      </div>
      <p className="action-outcome-preview">→ {action.detail.outcome}</p>
      <AnimatePresence>
        {open && (
          <motion.div className="action-card-body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
            <div className="action-finding">↳ {action.result.finding}</div>
            <p className="action-steps-heading">Implementation steps</p>
            <ol className="action-steps-list">
              {action.detail.steps.map((step, i) => (
                <li key={i} className="action-step-item">
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
            {action.detail.snippet && (
              <div className="snippet-block">
                <div className="snippet-header">
                  <span className="snippet-label">Code snippet</span>
                  <button className="snippet-copy" onClick={copySnippet}>{snippetCopied ? '✓ Copied' : '⎘ Copy'}</button>
                </div>
                <pre className="snippet-pre"><code>{action.detail.snippet}</code></pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionPlanPanel({ results }: { results: Record<string, ParamResult> }) {
  const allActions = getPrioritizedActions(results);
  const quickWins = getQuickWins(allActions);
  const overall = computeOverall(results);
  const failCount = allActions.filter(a => a.result.status === 'FAIL').length;
  const warnCount = allActions.filter(a => a.result.status === 'WARNING').length;
  const estGain = Math.min(100 - overall, Math.round(allActions.slice(0, 5).reduce((acc, a) => acc + (a.detail.impactValue * 6) * (a.param.weight / 1.5), 0)));

  return (
    <motion.div className="action-plan-panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="plan-summary-bar">
        <div className="plan-summary-item">
          <span className="plan-summary-value" style={{ color: '#dc2626' }}>{failCount}</span>
          <span className="plan-summary-label">Critical issues</span>
        </div>
        <div className="plan-summary-divider" />
        <div className="plan-summary-item">
          <span className="plan-summary-value" style={{ color: '#d97706' }}>{warnCount}</span>
          <span className="plan-summary-label">Warnings</span>
        </div>
        <div className="plan-summary-divider" />
        <div className="plan-summary-item">
          <span className="plan-summary-value" style={{ color: '#16a34a' }}>{quickWins.length}</span>
          <span className="plan-summary-label">Quick wins</span>
        </div>
        <div className="plan-summary-divider" />
        <div className="plan-summary-item">
          <span className="plan-summary-value" style={{ color: '#2563eb' }}>+{estGain}</span>
          <span className="plan-summary-label">Est. score gain</span>
        </div>
      </div>

      {quickWins.length > 0 && (
        <div className="plan-section">
          <div className="plan-section-header">
            <div className="plan-section-title-row">
              <span className="plan-section-icon">⚡</span>
              <span className="plan-section-title">Quick Wins</span>
              <span className="plan-section-sub">High impact · Low effort · Do these first</span>
            </div>
          </div>
          <div className="quick-wins-list">
            {quickWins.map((action, i) => <QuickWinCard key={action.param.key} action={action} index={i} />)}
          </div>
        </div>
      )}

      <div className="plan-section">
        <div className="plan-section-header">
          <div className="plan-section-title-row">
            <span className="plan-section-icon">◈</span>
            <span className="plan-section-title">Full Action Plan</span>
            <span className="plan-section-sub">Ordered by priority score — highest ROI first</span>
          </div>
        </div>
        {allActions.length === 0 ? (
          <div className="plan-empty">
            <span className="plan-empty-icon">✓</span>
            <p className="plan-empty-text">All parameters passing — no actions required.</p>
            <p className="plan-empty-sub">Re-run the audit monthly to catch regressions as your site evolves.</p>
          </div>
        ) : (
          <div className="action-list">
            {allActions.map((action, i) => <ActionCard key={action.param.key} action={action} rank={i + 1} />)}
          </div>
        )}
      </div>

      <div className="plan-footer-note">
        <span className="plan-footer-icon">ℹ</span>
        Priority scores are calculated as: <code>(parameter weight × impact) / effort</code>, scaled by issue severity (FAIL = 2×, WARNING = 1×). Estimated score gains are indicative — actual results depend on implementation quality and LLM re-indexing cycles.
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// RESULTS PANEL
// ═══════════════════════════════════════════════════════════════════

function ResultsPanel({ url, results, compareUrl, compareResults, sector, selectedLLMs, onShowBadge }: {
  url: string; results: Record<string, ParamResult>;
  compareUrl?: string; compareResults?: Record<string, ParamResult>;
  sector: string; selectedLLMs: string[]; onShowBadge: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [view, setView] = useState<ResultView>('diagnostics');
  const overall = computeOverall(results);
  const compareOverall = compareResults ? computeOverall(compareResults) : null;
  const benchmarks = SECTOR_BENCHMARKS[sector];
  const activeLLMs = LLMS.filter(l => selectedLLMs.includes(l.key));
  const liveCount = PARAMETERS.filter(p => results[p.key]?.isLive).length;
  const actionCount = getPrioritizedActions(results).length;

  return (
    <motion.div className="results-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="result-view-tabs">
        <button className={`result-view-tab ${view === 'diagnostics' ? 'active' : ''}`} onClick={() => setView('diagnostics')}>
          <span className="rvt-icon">◎</span>
          <span className="rvt-text">Diagnostics</span>
        </button>
        <button className={`result-view-tab ${view === 'plan' ? 'active' : ''}`} onClick={() => setView('plan')}>
          <span className="rvt-icon">◈</span>
          <span className="rvt-text">
            Action Plan
            {actionCount > 0 && <span className="rvt-count">{actionCount}</span>}
          </span>
        </button>
      </div>

      {view === 'diagnostics' && (
        <>
          <div className="panel-hero">
            <div className="panel-hero-left">
              <p className="panel-url">{url}</p>
              <p className="panel-summary">{getSummary(overall, url)}</p>
              {compareResults && compareUrl && <p className="panel-summary secondary" style={{ marginTop: 8 }}>{getSummary(compareOverall!, compareUrl)}</p>}
              <div className="panel-actions">
                <button className="badge-btn" onClick={onShowBadge}>◈ Get Score Badge</button>
                <div className="share-wrap">
                  <button className="badge-btn" onClick={() => setShareOpen(o => !o)}>↑ Share report</button>
                  <AnimatePresence>
                    {shareOpen && <ShareDropdown url={url} score={overall} onClose={() => setShareOpen(false)} />}
                  </AnimatePresence>
                </div>
              </div>
              {activeLLMs.length > 0 && (
                <div className="llm-coverage">
                  <span className="llm-coverage-label">Evaluated on</span>
                  <div className="llm-coverage-pills">
                    {activeLLMs.map(l => <span key={l.key} className="llm-coverage-pill">{l.icon} {l.label}</span>)}
                  </div>
                </div>
              )}
              {liveCount > 0 && (
                <p className="live-count-note">
                  <span className="live-badge" style={{ marginRight: 6 }}>LIVE</span>
                  {liveCount} of 12 parameters analysed with real data
                </p>
              )}
            </div>
            <div className="panel-hero-right">
              <div className="score-ring-group">
                <ScoreRing score={overall} />
                <p className="score-ring-label">{shortUrl(url)}</p>
              </div>
              {compareOverall !== null && compareResults && compareUrl && (
                <div className="score-ring-group">
                  <ScoreRing score={compareOverall} />
                  <p className="score-ring-label secondary">{shortUrl(compareUrl)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="panel-insights">
            <RadarChart results={results} benchmarks={benchmarks} sector={sector} />
            <UrgencyBlock score={overall} sector={sector} url={url} />
          </div>
          {GROUPS.map(group => {
            const items = PARAMETERS.filter(p => p.group === group.key);
            const gs = groupScore(results, group.key);
            const cgs = compareResults ? groupScore(compareResults, group.key) : null;
            return (
              <div key={group.key} className="group-block">
                <div className="group-block-header">
                  <span className="group-block-index">{group.index}</span>
                  <span className="group-block-label">{group.label}</span>
                  <div className="group-block-scores">
                    {cgs !== null && <span className="group-score-b" style={{ color: scoreColor(cgs) }}>{cgs}</span>}
                    <span className="group-score-a" style={{ color: scoreColor(gs) }}>{gs}</span>
                  </div>
                </div>
                <div className="params-list">
                  {items.map(p => (
                    <ParamRow key={p.key} param={p} result={results[p.key]}
                      compareResult={compareResults ? compareResults[p.key] : undefined}
                      mainLabel={shortUrl(url)} compareLabel={compareUrl ? shortUrl(compareUrl) : undefined}
                      benchmark={benchmarks ? benchmarks[p.key] : undefined} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {view === 'plan' && <ActionPlanPanel results={results} />}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [mode, setMode] = useState<Mode>('analyze');
  const [sector, setSector] = useState('Technology');
  const [lang, setLang] = useState<Lang>('ENG');
  const [selectedLLMs, setSelectedLLMs] = useState<string[]>(LLMS.map(l => l.key));
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [resultsA, setResultsA] = useState<Record<string, ParamResult> | null>(null);
  const [resultsB, setResultsB] = useState<Record<string, ParamResult> | null>(null);
  const [analyzedA, setAnalyzedA] = useState('');
  const [analyzedB, setAnalyzedB] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem('geo-history'); if (s) setHistory(JSON.parse(s)); } catch {}
  }, []);

  const saveHistory = (url: string, res: Record<string, ParamResult>, sec: string) => {
    const entry: HistoryEntry = { id: Date.now().toString(), url, date: new Date().toISOString(), overall: computeOverall(res), sector: sec };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try { localStorage.setItem('geo-history', JSON.stringify(updated)); } catch {}
  };

  const handleAnalyze = async () => {
    if (!urlA.trim()) return;
    if (mode === 'compare' && !urlB.trim()) return;
    setLoading(true); setResultsA(null); setResultsB(null);
    setAnalyzedA(urlA); setAnalyzedB(urlB);
    setLoadingMsg('Fetching PageSpeed and SEO data…');
    const liveA = await fetchAllRealData(urlA);
    setLoadingMsg('Checking Wikipedia authority…');
    await new Promise(r => setTimeout(r, 400));
    setLoadingMsg('Scanning /llms.txt and freshness signals…');
    await new Promise(r => setTimeout(r, 400));
    setLoadingMsg('Generating full GEO report…');
    const rA = generateResults(liveA as Record<string, number>);
    setResultsA(rA);
    saveHistory(urlA, rA, sector);
    if (mode === 'compare') {
      setLoadingMsg(`Running same analysis on ${shortUrl(urlB)}…`);
      const liveB = await fetchAllRealData(urlB);
      const rB = generateResults(liveB as Record<string, number>);
      setResultsB(rB);
      saveHistory(urlB, rB, sector);
    }
    setLoading(false);
  };

  const hasResults = resultsA !== null;
  const overall = resultsA ? computeOverall(resultsA) : 0;

  return (
    <div className="app">
      <header className="site-header">
        <span className="brand-logo">plain<span className="brand-accent">concepts</span></span>
        <div className="header-right">
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'ENG' ? 'active' : ''}`} onClick={() => setLang('ENG')}>ENG</button>
            <button className={`lang-btn ${lang === 'ESP' ? 'active' : ''}`} onClick={() => setLang('ESP')}>ESP</button>
          </div>
          <button className="connect-btn"><span className="connect-dot" />Connect your agent</button>
          <button className="history-btn" onClick={() => setShowHistory(true)}>
            ◷ History {history.length > 0 && <span className="history-count">{history.length}</span>}
          </button>
          <span className="site-tag">GEO Auditor · v2.0</span>
        </div>
      </header>

      <section className="hero-section">
        <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Generative Engine Optimization</motion.div>
        <motion.h1 className="hero-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          Assess your brand's visibility to evolve<br />your strategy toward AI-driven positioning.
        </motion.h1>
        <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Evaluate the signals that LLMs use to discover, trust and cite sources — before your competitors do.
        </motion.p>
      </section>

      <motion.div className="sector-selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <span className="sector-label">Your sector</span>
        <div className="sector-pills">
          {SECTORS.map(s => <button key={s} className={`sector-pill ${sector === s ? 'active' : ''}`} onClick={() => setSector(s)}>{s}</button>)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <LLMSelector selected={selectedLLMs} onChange={setSelectedLLMs} />
      </motion.div>

      {!hasResults && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}><UrgencyBlock sector={sector} /></motion.div>}

      <motion.div className="mode-tabs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <button className={`mode-tab ${mode === 'analyze' ? 'active' : ''}`} onClick={() => { setMode('analyze'); setResultsA(null); setResultsB(null); }}>
          <span className="tab-icon">◎</span>
          <span className="tab-text"><strong>Analyze</strong><small>Score a single brand or URL</small></span>
        </button>
        <button className={`mode-tab ${mode === 'compare' ? 'active' : ''}`} onClick={() => { setMode('compare'); setResultsA(null); setResultsB(null); }}>
          <span className="tab-icon">⊕</span>
          <span className="tab-text"><strong>Compare</strong><small>Benchmark two brands side by side</small></span>
        </button>
      </motion.div>

      <motion.div className="input-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <AnimatePresence mode="wait">
          {mode === 'analyze' ? (
            <motion.div key="a" className="input-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="input-wrap">
                <span className="input-prefix">URL</span>
                <input type="text" placeholder="https://yourbrand.com" value={urlA} onChange={e => setUrlA(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
              </div>
              <button className="cta-btn" onClick={handleAnalyze} disabled={loading || selectedLLMs.length === 0}>
                {loading ? <span className="btn-loading" /> : 'Analyze'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="b" className="input-row compare-input-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="compare-inputs">
                <div className="input-wrap">
                  <span className="input-prefix brand-a">A</span>
                  <input type="text" placeholder="https://yourbrand.com" value={urlA} onChange={e => setUrlA(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
                </div>
                <div className="compare-vs">vs</div>
                <div className="input-wrap">
                  <span className="input-prefix brand-b">B</span>
                  <input type="text" placeholder="https://competitor.com" value={urlB} onChange={e => setUrlB(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
                </div>
              </div>
              <button className="cta-btn" onClick={handleAnalyze} disabled={loading || selectedLLMs.length === 0}>
                {loading ? <span className="btn-loading" /> : 'Compare'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {selectedLLMs.length === 0 && <p className="llm-warning">Select at least one LLM to run the analysis.</p>}
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div className="loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="loading-dots">{[0,1,2].map(i => <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
            <p className="loading-text">{loadingMsg}</p>
            <p className="loading-subtext">Running across {selectedLLMs.length} LLM{selectedLLMs.length > 1 ? 's' : ''}: {LLMS.filter(l => selectedLLMs.includes(l.key)).map(l => l.label).join(', ')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasResults && !loading && (
          <div className="results-area">
            {mode === 'analyze' && resultsA && (
              <ResultsPanel url={analyzedA} results={resultsA} sector={sector} selectedLLMs={selectedLLMs} onShowBadge={() => setShowBadge(true)} />
            )}
            {mode === 'compare' && resultsA && resultsB && (
              <ResultsPanel url={analyzedA} results={resultsA} compareUrl={analyzedB} compareResults={resultsB} sector={sector} selectedLLMs={selectedLLMs} onShowBadge={() => setShowBadge(true)} />
            )}
          </div>
        )}
      </AnimatePresence>

      {!hasResults && !loading && (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="empty-grid">
            {['Entity & Authority', 'Content & Semantics', 'Technical & Visibility'].map((label, i) => (
              <div key={i} className="empty-card">
                <span className="empty-card-index">0{i + 1}</span>
                <span className="empty-card-label">{label}</span>
                <div className="empty-bars">{[70, 45, 85, 30].map((w, j) => <div key={j} className="empty-bar" style={{ width: `${w}%`, opacity: 0.15 + j * 0.07 }} />)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <footer className="site-footer">
        <span>GEO Auditor · {new Date().getFullYear()} · For demonstration purposes only</span>
        <span className="footer-credit">Demo created by Impact Studios</span>
      </footer>

      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div className="panel-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} />
            <HistoryPanel history={history} onClose={() => setShowHistory(false)} onSelect={entry => { setUrlA(entry.url); setSector(entry.sector); }} />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBadge && resultsA && <BadgeModal score={overall} url={analyzedA} onClose={() => setShowBadge(false)} />}
      </AnimatePresence>
    </div>
  );
}