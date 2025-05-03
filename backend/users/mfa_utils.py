import pyotp
import qrcode
import base64
import io
from django.conf import settings


def generate_mfa_secret():
    """Generate a new secret key for MFA"""
    return pyotp.random_base32()


def verify_mfa_token(secret, token):
    """Verify the token against the secret key"""
    totp = pyotp.TOTP(secret)
    return totp.verify(token)


def get_mfa_qr_code_url(user, secret):
    """Generate the URL for the QR code"""
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email, issuer_name=settings.MFA_ISSUER_NAME
    )


def generate_mfa_qr_code_base64(user, secret):
    """Generate a QR code as a base64 image"""
    qr_code_url = get_mfa_qr_code_url(user, secret)
    img = qrcode.make(qr_code_url)

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"
