#!/usr/bin/env python3
"""Ataque exhaustivo educativo al cifrado afín.

Modelo por defecto: alfabeto castellano normalizado de 26 letras (Ñ -> N).
Solo se prueban multiplicadores invertibles módulo m y se conservan espacios,
signos y números. Los candidatos se ordenan mediante una puntuación simple
basada en frecuencias aproximadas del castellano.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from math import gcd
import unicodedata

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
FREQUENCIES = {
    "A": 12.53, "B": 1.42, "C": 4.68, "D": 5.86, "E": 13.68,
    "F": 0.69, "G": 1.01, "H": 0.70, "I": 6.25, "J": 0.44,
    "K": 0.02, "L": 4.97, "M": 3.15, "N": 6.71, "O": 8.68,
    "P": 2.51, "Q": 0.88, "R": 6.87, "S": 7.98, "T": 4.63,
    "U": 3.93, "V": 0.90, "W": 0.01, "X": 0.22, "Y": 0.90,
    "Z": 0.52,
}


@dataclass(frozen=True)
class Candidate:
    a: int
    b: int
    score: float
    plaintext: str


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.upper())
    without_marks = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    return without_marks.replace("Ñ", "N")


def inverse_mod(a: int, modulus: int) -> int:
    if gcd(a, modulus) != 1:
        raise ValueError(f"{a} no tiene inverso módulo {modulus}")
    return pow(a, -1, modulus)


def decrypt_affine(ciphertext: str, a: int, b: int, alphabet: str = ALPHABET) -> str:
    modulus = len(alphabet)
    inverse = inverse_mod(a, modulus)
    index = {char: position for position, char in enumerate(alphabet)}
    result: list[str] = []

    for original in normalize(ciphertext):
        if original not in index:
            result.append(original)
            continue
        plain_index = (inverse * (index[original] - b)) % modulus
        result.append(alphabet[plain_index])
    return "".join(result)


def chi_square(text: str, alphabet: str = ALPHABET) -> float:
    letters = [char for char in normalize(text) if char in alphabet]
    if not letters:
        return float("inf")
    counts = Counter(letters)
    total = len(letters)
    score = 0.0
    for letter in alphabet:
        expected = total * FREQUENCIES.get(letter, 0.01) / 100
        observed = counts.get(letter, 0)
        score += (observed - expected) ** 2 / max(expected, 1e-9)
    return score


def attack(ciphertext: str, alphabet: str = ALPHABET) -> list[Candidate]:
    modulus = len(alphabet)
    candidates: list[Candidate] = []
    for a in range(modulus):
        if gcd(a, modulus) != 1:
            continue
        for b in range(modulus):
            plaintext = decrypt_affine(ciphertext, a, b, alphabet)
            candidates.append(Candidate(a, b, chi_square(plaintext, alphabet), plaintext))
    return sorted(candidates, key=lambda item: item.score)


def main() -> None:
    ciphertext = input("Ingrese el criptograma: ").strip()
    if not ciphertext:
        raise SystemExit("No se ingresó ningún criptograma.")
    candidates = attack(ciphertext)
    print(f"\nSe probaron {len(candidates)} claves válidas. Mejores candidatos:\n")
    for rank, candidate in enumerate(candidates[:15], start=1):
        print(f"#{rank:02d}  a={candidate.a:2d}  b={candidate.b:2d}  χ²={candidate.score:8.2f}")
        print(candidate.plaintext)
        print()


if __name__ == "__main__":
    main()
