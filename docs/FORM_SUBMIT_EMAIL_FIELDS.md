# Form Submit Emails — Fields Recipients See

All CTAs send a plain-text email to Deal Desk via Resend.

---

## 1. Activate (Audience Card)

**CTA:** Activate → Send Me the Deal ID

```
New Deal ID request submitted from Audience Tool

Requestor
- Name: {name}
- Company: {company}
- Email: {email}

Deal setup details
- DSP / Platform(s): {platforms}
- DSP CIDs:
  - {platform}: {seat id}
  - Not provided
- Flight Date: {date or date range}
- Preferred Inventory Channel: {value or "Not provided"}

Audiences
1. {audience name}

Notes
{notes or "None"}

Metadata
- Submitted At (UTC): {timestamp}
- App Variant: {variant}
```

---

## 2. Activate (Moment Card)

**CTA:** Activate → Send Me the Deal ID

```
New Deal ID request submitted from Audience Tool

Requestor
- Name: {name}
- Company: {company}
- Email: {email}

Deal setup details
- DSP / Platform(s): {platforms}
- DSP CIDs:
  - {platform}: {seat id}
  - Not provided
- Flight Date: {date or date range}
- Preferred Inventory Channel: {value or "Not provided"}

Moments
1. {moment name}

Notes
{notes or "None"}

Metadata
- Submitted At (UTC): {timestamp}
- App Variant: {variant}
```

---

## 3. Request a Custom Audience (Header)

**CTA:** Request a Custom Audience → Submit Request

```
New Deal ID request submitted from Audience Tool

Requestor
- Name: {name}
- Company: {company}
- Email: {email}

Deal setup details
- DSP / Platform(s): {platforms}
- DSP CIDs:
  - {platform}: {seat id}
  - Not provided
- Flight Date: {date or date range}
- Preferred Inventory Channel: {value or "Not provided"}

Custom Audience Request
1. {audience description}

Notes
{audience description}

{additional notes}

Metadata
- Submitted At (UTC): {timestamp}
- App Variant: {variant}
```

---

## 4. Submit Deal (Deal Builder)

**CTA:** Submit Deal → Send Me the Deal ID

```
New Deal ID request submitted from Audience Tool

Requestor
- Name: {name}
- Company: {company}
- Email: {email}

Deal setup details
- DSP / Platform(s): {platforms}
- DSP CIDs:
  - {platform}: {seat id}
  - Not provided
- Flight Date: {date or date range}
- Preferred Inventory Channel: {value or "Not provided"}

Custom Deal
Audience: {audience name}
Moment: {moment name}

Notes
{notes or "None"}

Metadata
- Submitted At (UTC): {timestamp}
- App Variant: {variant}
```

---

## 5. Activate (Index Exchange)

**CTA:** Activate → Submit Deal Request

```
New Deal ID request submitted from Audience Tool

Requestor
- Name: {name}
- Company: {company}
- Email: {email}

Deal setup details
- DSP / Platform(s): {platforms}
- Buyer Seat: {buyer seat}
- Flight Date: {date or date range}

Campaign details
- Campaign Name: {campaign name}
- Approx Budget: {budget}
- SSP Preference: {ssp}
- Preferred Inventory Channel: {value or "Not provided"}

Audiences
1. {audience name}

Notes
{notes or "None"}

Metadata
- Submitted At (UTC): {timestamp}
- App Variant: index-exchange
```
