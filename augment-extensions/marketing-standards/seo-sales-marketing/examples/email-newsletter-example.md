# Email Newsletter Example

## Overview

Responsive HTML email newsletter template with mobile-first design, CAN-SPAM compliance, and best practices for deliverability and engagement.

---

## HTML Email Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Monthly Newsletter - January 2026</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f4f4f4;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Header */
    .header {
      background-color: #0066cc;
      padding: 20px;
      text-align: center;
    }
    
    .header img {
      max-width: 200px;
      height: auto;
    }
    
    /* Content */
    .content {
      padding: 30px 20px;
    }
    
    .content h1 {
      color: #333333;
      font-size: 24px;
      margin: 0 0 20px 0;
      line-height: 1.3;
    }
    
    .content h2 {
      color: #0066cc;
      font-size: 20px;
      margin: 30px 0 15px 0;
    }
    
    .content p {
      color: #666666;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    
    /* Button */
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: #0066cc;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .button:hover {
      background-color: #0052a3;
    }
    
    /* Article card */
    .article-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .article-card img {
      max-width: 100%;
      height: auto;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    
    /* Footer */
    .footer {
      background-color: #333333;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
      font-size: 14px;
    }
    
    .footer a {
      color: #ffffff;
      text-decoration: underline;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 10px;
    }
    
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .content h1 { font-size: 20px !important; }
      .content h2 { font-size: 18px !important; }
      .content p { font-size: 14px !important; }
      .button { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body>
  <!-- Preheader text (hidden but shows in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Your monthly dose of insights, tips, and updates from [Company Name]
  </div>
  
  <!-- Email container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Header -->
          <tr>
            <td class="header">
              <img src="https://cdn.example.com/logo-white.png" alt="Company Logo" width="200">
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td class="content">
              <h1>Welcome to Our January Newsletter! 🎉</h1>
              
              <p>Hi {{first_name}},</p>
              
              <p>Happy New Year! We're excited to share what's new this month, including product updates, helpful resources, and exclusive offers just for you.</p>
              
              <!-- Featured article -->
              <div class="article-card">
                <img src="https://cdn.example.com/featured-article.jpg" alt="Featured Article">
                <h2>10 Strategies to Boost Your Productivity in 2026</h2>
                <p>Discover proven techniques to maximize your efficiency and achieve your goals this year.</p>
                <a href="https://example.com/article/productivity-2026" class="button">Read More</a>
              </div>
              
              <!-- Product update -->
              <h2>🚀 New Feature: AI-Powered Analytics</h2>
              <p>We've just launched our most requested feature! Get instant insights from your data with our new AI-powered analytics dashboard.</p>
              <a href="https://example.com/features/ai-analytics" class="button">Try It Now</a>
              
              <!-- Blog posts -->
              <h2>📚 Latest from Our Blog</h2>
              
              <p><strong><a href="https://example.com/blog/post-1">How to Optimize Your Workflow</a></strong><br>
              Learn the secrets to streamlining your daily tasks.</p>
              
              <p><strong><a href="https://example.com/blog/post-2">Customer Success Story: Acme Corp</a></strong><br>
              See how Acme Corp increased revenue by 150% using our platform.</p>
              
              <p><strong><a href="https://example.com/blog/post-3">5 Common Mistakes to Avoid</a></strong><br>
              Don't fall into these traps - here's what to watch out for.</p>
              
              <!-- Special offer -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #856404;">🎁 Exclusive Offer for Subscribers</h2>
                <p style="color: #856404; margin-bottom: 10px;">Get 20% off any annual plan this month! Use code <strong>JAN2026</strong> at checkout.</p>
                <a href="https://example.com/pricing?code=JAN2026" class="button" style="background-color: #ffc107; color: #000000 !important;">Claim Your Discount</a>
              </div>
              
              <!-- Upcoming events -->
              <h2>📅 Upcoming Events</h2>
              <p><strong>Webinar: Mastering Data Analytics</strong><br>
              January 25, 2026 at 2:00 PM EST<br>
              <a href="https://example.com/webinar/data-analytics">Register Now</a></p>
              
              <p><strong>Product Demo: New Features Walkthrough</strong><br>
              February 1, 2026 at 11:00 AM EST<br>
              <a href="https://example.com/demo/new-features">Save Your Spot</a></p>
              
              <!-- Closing -->
              <p style="margin-top: 30px;">Thanks for being part of our community! If you have any questions or feedback, just reply to this email.</p>
              
              <p>Best regards,<br>
              <strong>The [Company Name] Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <!-- Social links -->
              <div class="social-links">
                <a href="https://twitter.com/company"><img src="https://cdn.example.com/icon-twitter.png" alt="Twitter" width="32"></a>
                <a href="https://linkedin.com/company/company"><img src="https://cdn.example.com/icon-linkedin.png" alt="LinkedIn" width="32"></a>
                <a href="https://facebook.com/company"><img src="https://cdn.example.com/icon-facebook.png" alt="Facebook" width="32"></a>
              </div>
              
              <!-- Company info -->
              <p style="margin: 10px 0;">
                <strong>[Company Name]</strong><br>
                123 Main Street, Suite 100<br>
                San Francisco, CA 94105
              </p>
              
              <!-- CAN-SPAM compliance -->
              <p style="margin: 20px 0 10px 0; font-size: 12px; color: #999999;">
                You're receiving this email because you subscribed to our newsletter.<br>
                <a href="{{unsubscribe_url}}" style="color: #999999;">Unsubscribe</a> | 
                <a href="{{preferences_url}}" style="color: #999999;">Update Preferences</a> | 
                <a href="https://example.com/privacy" style="color: #999999;">Privacy Policy</a>
              </p>
              
              <p style="font-size: 12px; color: #999999;">
                © 2026 [Company Name]. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## CAN-SPAM Compliance Checklist

### Required Elements

✅ **Accurate "From" Information**
- Use real company name and email address
- Don't use misleading sender information

✅ **Clear Subject Line**
- Subject must accurately reflect email content
- No deceptive subject lines

✅ **Identify as Advertisement (if applicable)**
- Clearly disclose if email is promotional

✅ **Physical Address**
- Include valid physical postal address
- Can be street address or P.O. box

✅ **Unsubscribe Mechanism**
- Provide clear, conspicuous unsubscribe link
- Process unsubscribe requests within 10 business days
- Don't charge fee or require login to unsubscribe

✅ **Honor Opt-Outs Promptly**
- Stop sending emails within 10 business days
- Don't sell/transfer email addresses of unsubscribers

---

## Email Best Practices

### Subject Lines

**Good Examples:**
- "Your January Newsletter: New Features + Exclusive Offer 🎁"
- "[First Name], here's your personalized productivity guide"
- "Last chance: 20% off ends tonight"

**Bad Examples:**
- "RE: Important" (misleading)
- "FREE MONEY!!!" (spammy)
- "You won't believe this..." (clickbait)

### Preheader Text

The preheader appears after the subject line in inbox previews. Use it wisely:

```html
<!-- Good preheader -->
<div style="display: none; max-height: 0; overflow: hidden;">
  New features, exclusive offers, and productivity tips inside
</div>
```

### Personalization

Use merge tags for personalization:
- `{{first_name}}` - First name
- `{{company}}` - Company name
- `{{last_purchase}}` - Last purchase date
- `{{custom_field}}` - Any custom field

### Mobile Optimization

- Use single-column layout
- Minimum 14px font size
- Large, tappable buttons (44x44px minimum)
- Optimize images for mobile (compress, use responsive images)
- Test on multiple devices and email clients

---

## Testing Checklist

### Before Sending

- [ ] Test on major email clients (Gmail, Outlook, Apple Mail)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Check all links work correctly
- [ ] Verify personalization tokens populate correctly
- [ ] Test unsubscribe link
- [ ] Check images load (and alt text displays if blocked)
- [ ] Proofread all copy
- [ ] Verify CAN-SPAM compliance
- [ ] Run spam score test (Mail Tester, Litmus)
- [ ] Send test to team for review

---

## Performance Metrics

### Key Metrics to Track

- **Open Rate:** 15-25% (average), 25%+ (good)
- **Click-Through Rate:** 2-5% (average), 5%+ (good)
- **Conversion Rate:** 1-3% (average), 3%+ (good)
- **Unsubscribe Rate:** <0.5% (good), <0.2% (excellent)
- **Bounce Rate:** <2% (good), <1% (excellent)
- **Spam Complaint Rate:** <0.1% (critical threshold)

### A/B Testing Ideas

1. **Subject Lines:** With/without emoji, personalization, urgency
2. **Send Time:** Morning vs. afternoon, weekday vs. weekend
3. **Content:** Long vs. short, single topic vs. digest
4. **CTA:** Button text, color, placement
5. **Images:** With/without hero image, product photos

---

## Related Resources

- **conversion-optimization.md** - CTA and email optimization
- **content-marketing.md** - Email content strategy
- **universal-marketing.md** - Email metrics and KPIs

