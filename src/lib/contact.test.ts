import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cvFor, invalidContactEntries, readContactConfig, validCvPath, validEmail, validLinkedIn } from './contact.ts'

test('une configuration vide masque toutes les coordonnées', () => {
  assert.deepEqual(readContactConfig({}), { email: null, linkedin: null, cv: { fr: null, en: null } })
  assert.deepEqual(readContactConfig({ VITE_CONTACT_EMAIL: '   ', VITE_LINKEDIN_URL: '' }).email, null)
  assert.deepEqual(invalidContactEntries({}), [])
})

test('e-mail : accepte une adresse simple, refuse le reste', () => {
  assert.equal(validEmail(' prenom.nom@example.com '), 'prenom.nom@example.com')
  for (const bad of ['prenom', 'a@b', 'a b@example.com', 'a@example.com?subject=x', 'javascript:alert(1)@x.com']) {
    assert.equal(validEmail(bad), null, bad)
  }
})

test('LinkedIn : seul un profil https://www.linkedin.com/in/… est accepté', () => {
  assert.equal(validLinkedIn('https://www.linkedin.com/in/prenom-nom'), 'https://www.linkedin.com/in/prenom-nom')
  assert.equal(validLinkedIn('https://linkedin.com/in/prenom-nom/'), 'https://linkedin.com/in/prenom-nom/')
  for (const bad of ['http://www.linkedin.com/in/prenom', 'https://evil.com/in/prenom', 'https://www.linkedin.com/company/x', 'https://www.linkedin.com/in/']) {
    assert.equal(validLinkedIn(bad), null, bad)
  }
})

test('CV : uniquement un PDF servi depuis /cv/', () => {
  assert.equal(validCvPath('/cv/cv-fr.pdf'), '/cv/cv-fr.pdf')
  for (const bad of ['cv.pdf', '/cv/CV.pdf', '/cv/../secret.pdf', 'https://example.com/cv.pdf', '/cv/cv.docx']) {
    assert.equal(validCvPath(bad), null, bad)
  }
})

test('une valeur renseignée mais invalide est signalée', () => {
  assert.deepEqual(invalidContactEntries({ VITE_CONTACT_EMAIL: 'pas-un-email', VITE_CV_URL_EN: '/cv/ok.pdf' }), ['VITE_CONTACT_EMAIL'])
})

test('CV : langue de la page, sinon l’autre langue signalée', () => {
  const both = readContactConfig({ VITE_CV_URL_FR: '/cv/fr.pdf', VITE_CV_URL_EN: '/cv/en.pdf' })
  assert.deepEqual(cvFor(both, 'en'), { href: '/cv/en.pdf', otherLanguage: false })
  const frOnly = readContactConfig({ VITE_CV_URL_FR: '/cv/fr.pdf' })
  assert.deepEqual(cvFor(frOnly, 'en'), { href: '/cv/fr.pdf', otherLanguage: true })
  assert.equal(cvFor(readContactConfig({}), 'fr'), null)
})
