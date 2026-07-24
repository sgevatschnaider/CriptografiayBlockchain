import unittest

from scripts.afin_bruteforce import attack, decrypt_affine, inverse_mod


class AffineCipherTests(unittest.TestCase):
    def test_inverse_mod(self):
        self.assertEqual(inverse_mod(5, 26), 21)

    def test_invalid_multiplier(self):
        with self.assertRaises(ValueError):
            inverse_mod(2, 26)

    def test_known_decryption(self):
        ciphertext = "GDNKRAUVHKDCRD"
        plaintext = decrypt_affine(ciphertext, 5, 3)
        self.assertTrue(plaintext.startswith("LACRIPTOGRAFIA"))

    def test_attack_includes_all_valid_keys(self):
        candidates = attack("GDNKRAUVHKDCRD")
        self.assertEqual(len(candidates), 312)
        self.assertTrue(any(item.a == 5 and item.b == 3 for item in candidates))


if __name__ == "__main__":
    unittest.main()
