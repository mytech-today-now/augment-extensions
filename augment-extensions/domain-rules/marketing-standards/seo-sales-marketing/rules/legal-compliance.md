# Legal Compliance Standards

## Overview

Guidelines for ensuring marketing content complies with FTC, CAN-SPAM, GDPR, WCAG, and other legal requirements.

---

## FTC Guidelines (Federal Trade Commission)

### Disclosure Requirements

**Sponsored Content**:
- Clearly label sponsored posts with "Sponsored", "Ad", or "Paid Partnership"
- Place disclosure above the fold, before "Read More" links
- Use clear, unambiguous language (not just #ad or #sponsored)

**Affiliate Links**:
- Disclose affiliate relationships before links
- Use language like "This post contains affiliate links"
- Make disclosure visible and understandable

**Endorsements and Testimonials**:
- Disclose material connections (payment, free products, relationships)
- Ensure testimonials reflect typical results or include disclaimer
- Don't use fake reviews or testimonials

### Example Disclosures

```markdown
**Disclosure**: This post contains affiliate links. We may earn a commission if you make a purchase through these links at no additional cost to you.

**Sponsored**: This content is sponsored by [Brand Name]. All opinions are our own.
```

---

## CAN-SPAM Act (Email Marketing)

### Required Elements

1. **Accurate Header Information**:
   - From, To, Reply-To must be accurate
   - Subject line must reflect email content
   - No deceptive routing information

2. **Clear Identification as Advertisement**:
   - Label promotional emails clearly
   - Use "Advertisement" or "Promotional" in subject or body

3. **Physical Postal Address**:
   - Include valid physical postal address
   - Can be street address or P.O. Box

4. **Unsubscribe Mechanism**:
   - Provide clear, conspicuous unsubscribe link
   - Process opt-outs within 10 business days
   - Don't require login to unsubscribe
   - Don't charge fees for unsubscribing

5. **Honor Opt-Outs Promptly**:
   - Stop sending emails within 10 business days
   - Don't sell or transfer email addresses of opt-outs

### Email Footer Template

```html
<footer>
  <p>You're receiving this email because you subscribed to our newsletter.</p>
  <p><a href="{{unsubscribe_link}}">Unsubscribe</a> | <a href="{{preferences_link}}">Update Preferences</a></p>
  <p>{{Company Name}}<br>
  {{Street Address}}<br>
  {{City, State ZIP}}</p>
</footer>
```

---

## GDPR (General Data Protection Regulation)

### Consent Requirements

**Explicit Consent**:
- Use clear, affirmative action (checkbox, button)
- Don't use pre-checked boxes
- Separate consent for different purposes
- Provide granular control (email, SMS, phone)

**Consent Language**:
```html
<label>
  <input type="checkbox" name="marketing_consent" required>
  I consent to receive marketing emails from [Company]. I understand I can withdraw consent at any time.
</label>
```

### Data Processing Transparency

**Privacy Policy Must Include**:
- What data is collected
- How data is used
- Who data is shared with
- How long data is retained
- User rights (access, deletion, portability)

### User Rights

1. **Right to Access**: Provide data upon request
2. **Right to Erasure**: Delete data upon request ("right to be forgotten")
3. **Right to Portability**: Export data in machine-readable format
4. **Right to Rectification**: Correct inaccurate data

### Cookie Consent

```html
<div class="cookie-banner">
  <p>We use cookies to improve your experience. By continuing, you consent to our use of cookies.</p>
  <button onclick="acceptCookies()">Accept</button>
  <button onclick="rejectCookies()">Reject</button>
  <a href="/privacy-policy">Learn More</a>
</div>
```

---

## WCAG 2.1 AA (Web Content Accessibility Guidelines)

### Color Contrast Requirements

- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio

**Tools**: WebAIM Contrast Checker, Chrome DevTools

### Keyboard Navigation

- All interactive elements accessible via keyboard
- Visible focus indicators (outline, border, background change)
- Logical tab order (left-to-right, top-to-bottom)
- Skip navigation links for screen readers

### Alternative Text

**Images**:
```html
<img src="product.jpg" alt="Blue running shoes with white laces">
```

**Decorative Images**:
```html
<img src="decoration.jpg" alt="" role="presentation">
```

**Complex Images** (charts, diagrams):
- Provide detailed description in adjacent text or `<figcaption>`

### Semantic HTML

```html
<!-- DO -->
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- DON'T -->
<div class="nav">
  <div class="link" onclick="navigate()">Home</div>
</div>
```

---

## Copyright and Trademark Usage

### Copyright

- **Original Content**: Automatically copyrighted upon creation
- **Attribution**: Credit sources when using others' content
- **Fair Use**: Limited use for commentary, criticism, education
- **Licensing**: Respect Creative Commons and other licenses

### Trademarks

- Use ™ for unregistered trademarks
- Use ® for registered trademarks
- Don't use competitors' trademarks in misleading ways
- Follow brand guidelines when mentioning other brands

---

## Privacy Policy Requirements

### Essential Sections

1. **Information Collection**: What data is collected (name, email, IP, cookies)
2. **Use of Information**: How data is used (marketing, analytics, personalization)
3. **Data Sharing**: Third parties with access (analytics, email providers)
4. **Data Security**: How data is protected (encryption, secure servers)
5. **User Rights**: How to access, modify, delete data
6. **Contact Information**: How to reach privacy officer

---

## Compliance Checklist

Before publishing marketing content:

- [ ] **FTC**: Disclosures for sponsored content and affiliate links
- [ ] **CAN-SPAM**: Unsubscribe link, physical address, accurate headers
- [ ] **GDPR**: Explicit consent, privacy policy link, data rights
- [ ] **WCAG**: 4.5:1 color contrast, alt text, keyboard navigation
- [ ] **Copyright**: Proper attribution for images and quotes
- [ ] **Trademarks**: Correct usage of ™ and ® symbols

---

## Resources

- **FTC**: [ftc.gov/business-guidance](https://www.ftc.gov/business-guidance)
- **CAN-SPAM**: [ftc.gov/can-spam](https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business)
- **GDPR**: [gdpr.eu](https://gdpr.eu/)
- **WCAG**: [w3.org/WAI/WCAG21/quickref](https://www.w3.org/WAI/WCAG21/quickref/)
- **Accessibility Testing**: WebAIM, WAVE, axe DevTools

