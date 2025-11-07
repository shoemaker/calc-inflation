# -----------------------------------------------------------------------------
# Encryption / Decryption Notes
#
# Files are encrypted using AES-256-CBC with PBKDF2 key derivation.
#   - AES-256-CBC is a strong, widely supported cipher.
#   - PBKDF2 derives the encryption key from the password using 100,000 iterations,
#     making brute-force attacks significantly harder.
#   - The `-salt` flag ensures each encryption produces unique ciphertext,
#     even with the same password.
#
# Commands used:
#   Encrypt:
#     openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt \
#       -in config.js -out config.js.enc
#
#   Decrypt:
#     openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -d \
#       -in config.js.enc -out config.js
#
# Notes:
#   - This scheme is compatible with OpenSSL 3+ and does NOT require the legacy provider.
#   - The password prompt appears interactively when running `make encrypt_conf`
#     or `make decrypt_conf`.
# -----------------------------------------------------------------------------

.PHONY: _pwd_prompt decrypt_conf encrypt_conf
 
CONF_FILE=config.js
 
# 'private' task for echoing instructions
_pwd_prompt:
	@echo "Contact brianshoemaker+dev@gmail.com for the password."
 
# to create config.js
decrypt_conf: _pwd_prompt
	openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -d -in "${CONF_FILE}.enc" -out "${CONF_FILE}"
	chmod 600 ${CONF_FILE}
 
# for updating config.js
encrypt_conf: _pwd_prompt
	openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -in "${CONF_FILE}" -out "${CONF_FILE}.enc"