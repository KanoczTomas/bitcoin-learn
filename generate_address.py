import ecdsa
import base58
import hashlib
import os

#private_key = os.urandom(32);
private_key = "ce59a7b52814be59b483b25081ef448256e7acdaee6ae8b4b7674c78b1b8667c"

signing_key = ecdsa.SigningKey.from_string(private_key.decode('hex'), curve=ecdsa.SECP256k1);
verification_key = signing_key.get_verifying_key().to_string();

def create_p2pkh_address(public_key, debug=False, testnet=False):
  padded_pk = '\04' + public_key;
  ripemd160=hashlib.new('ripemd160');
  ripemd160.update(hashlib.sha256(padded_pk).digest())
  hash_pk = ripemd160.digest()
  padded_hash_pk = '\00' + hash_pk
  if(testnet): padded_hash_pk = 'o' + hash_pk
  checksum = hashlib.sha256(hashlib.sha256(padded_hash_pk).digest()).digest()[:4]
  address_bin = padded_hash_pk + checksum
  if(debug):
    print 20*'='
    print "public key is: " + public_key.encode('hex')
    print "after pading 0x04: " + padded_pk.encode('hex')
    print "sha256 of padded public key: " + hashlib.sha256(padded_pk).hexdigest()
    print "ripemd16 of sha256 of padded public key: " + hash_pk.encode('hex')
    print "padding with 0x00(0x6f for testnet) to create checksum: " + padded_hash_pk.encode('hex')
    print "checksum hash = sha256(sha256(of above): " + hashlib.sha256(hashlib.sha256(padded_hash_pk).digest()).hexdigest()
    print "taking 4 bytes of checksum hash and concatenating to padded hash: " + address_bin.encode('hex')
    print "base58 encoding of binary address follows ... "

  return base58.b58encode(address_bin)

print "our address is: " + create_p2pkh_address(verification_key, debug=True)
print "our testnet address is: " + create_p2pkh_address(verification_key, debug=True, testnet=True)
  
