import os
import asyncio
import logging

logger = logging.getLogger(__name__)

RECIPIENT_EMAIL = "info@edvnova.com"


async def send_email(to_email: str, subject: str, html_content: str):
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        return {"id": "mock", "status": "mocked", "to": to_email, "subject": subject}

    import resend
    resend.api_key = api_key
    sender = os.environ.get("SENDER_EMAIL", "EdVNova <onboarding@resend.dev>")
    try:
        result = await asyncio.to_thread(resend.Emails.send, {
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        })
        logger.info(f"Email sent to {to_email}: {result}")
        return result
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return None


async def notify_contact_form(name: str, email: str, phone: str, message: str, subject: str = ""):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0B1F3A;border-bottom:2px solid #2563EB;padding-bottom:10px">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:120px">Name</td><td style="padding:8px 0;color:#0B1F3A">{name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555">Email</td><td style="padding:8px 0;color:#0B1F3A"><a href="mailto:{email}">{email}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555">Phone</td><td style="padding:8px 0;color:#0B1F3A"><a href="tel:{phone}">{phone}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555">Subject</td><td style="padding:8px 0;color:#0B1F3A">{subject or 'General Inquiry'}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px">
            <p style="margin:0;font-weight:bold;color:#555;font-size:13px">Message</p>
            <p style="margin:8px 0 0;color:#0B1F3A;line-height:1.6">{message}</p>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#999">Sent from EdVNova Learning Platform</p>
    </div>"""
    await send_email(RECIPIENT_EMAIL, f"[EdVNova] Contact: {name} — {subject or 'General Inquiry'}", html)


async def notify_new_order(order_id: str, user_email: str, items: list, total: float, address: str, phone: str):
    items_html = "".join(
        f'<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">{it["product_title"]}</td>'
        f'<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">{it["quantity"]}</td>'
        f'<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">₹{it["subtotal"]:,.0f}</td></tr>'
        for it in items
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0B1F3A;border-bottom:2px solid #2563EB;padding-bottom:10px">New Order Received</h2>
        <p style="color:#555">Order <strong>#{order_id[-8:]}</strong> from <strong>{user_email}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#f8fafc"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#555">Item</th><th style="padding:8px 12px;text-align:center;font-size:13px;color:#555">Qty</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#555">Price</th></tr></thead>
            <tbody>{items_html}</tbody>
            <tfoot><tr><td colspan="2" style="padding:10px 12px;font-weight:bold">Total</td><td style="padding:10px 12px;text-align:right;font-weight:bold;color:#0B1F3A">₹{total:,.0f}</td></tr></tfoot>
        </table>
        <div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:12px">
            <p style="margin:0;font-size:13px"><strong>Phone:</strong> {phone}</p>
            <p style="margin:4px 0 0;font-size:13px"><strong>Address:</strong> {address}</p>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#999">Sent from EdVNova Learning Platform</p>
    </div>"""
    await send_email(RECIPIENT_EMAIL, f"[EdVNova] New Order #{order_id[-8:]} — ₹{total:,.0f}", html)
