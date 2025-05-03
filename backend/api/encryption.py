import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature


def generate_aes_key():
    return os.urandom(32)  # AES-256


def encrypt_file_aes(input_path, output_path, key):
    iv = os.urandom(16)  # AES block size for CBC
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    with open(input_path, "rb") as f:
        plaintext = f.read()

    # PKCS7 padding
    pad_len = 16 - len(plaintext) % 16
    plaintext += bytes([pad_len] * pad_len)

    ciphertext = encryptor.update(plaintext) + encryptor.finalize()

    with open(output_path, "wb") as f:
        f.write(iv + ciphertext)


def encrypt_key_rsa(key, public_key_path, output_path):
    with open(public_key_path, "rb") as f:
        pubkey = serialization.load_pem_public_key(f.read(), backend=default_backend())

    encrypted_key = pubkey.encrypt(
        key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )

    with open(output_path, "wb") as f:
        f.write(encrypted_key)


def decrypt_file_aes(encrypted_path, output_path, key):
    with open(encrypted_path, "rb") as f:
        iv = f.read(16)
        ciphertext = f.read()

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

    # Remove PKCS7 padding
    pad_len = padded_plaintext[-1]
    plaintext = padded_plaintext[:-pad_len]

    with open(output_path, "wb") as f:
        f.write(plaintext)


def sign_file(input_path, private_key_path, output_path):
    with open(private_key_path, "rb") as f:
        privkey = serialization.load_pem_private_key(
            f.read(), password=None, backend=default_backend()
        )

    with open(input_path, "rb") as f:
        data = f.read()

    signature = privkey.sign(data, padding.PKCS1v15(), hashes.SHA256())

    with open(output_path, "wb") as f:
        f.write(signature)


def verify_file_signature(input_path, signature_path, public_key_path):
    with open(public_key_path, "rb") as f:
        pubkey = serialization.load_pem_public_key(f.read(), backend=default_backend())

    with open(input_path, "rb") as f:
        data = f.read()

    with open(signature_path, "rb") as f:
        signature = f.read()

    try:
        pubkey.verify(signature, data, padding.PKCS1v15(), hashes.SHA256())
        return True  # Signature is valid
    except InvalidSignature:
        return False  # Signature is invalid
