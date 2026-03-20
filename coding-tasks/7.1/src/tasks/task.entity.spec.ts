import { EncryptionTransformer } from 'typeorm-encrypted';

// ---------------------------------------------------------------
// Tests for the AES-256-CBC encryption transformer wired to the
// Task.description column in task.entity.ts.
//
// These are pure unit tests — no database or NestJS bootstrap
// required. We instantiate EncryptionTransformer directly and
// exercise its to() (encrypt) and from() (decrypt) methods.
// ---------------------------------------------------------------

const TEST_KEY = 'd85117047fd06d3afa79b6e44ee3a52eb426fc24c3a2e3667732e8da0342b4da';

const transformer = new EncryptionTransformer({
  key: TEST_KEY,
  algorithm: 'aes-256-cbc',
  ivLength: 16,
});

describe('EncryptionTransformer (Task.description)', () => {
  // ------------------------------------------------------------------
  // Encryption — to()
  // ------------------------------------------------------------------

  describe('to() — encrypt on write', () => {
    it('returns a non-empty string for a plaintext input', () => {
      const result = transformer.to('Buy groceries') as string;
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('does NOT store the original plaintext', () => {
      const plaintext = 'My secret task description';
      const ciphertext = transformer.to(plaintext) as string;
      expect(ciphertext).not.toBe(plaintext);
      expect(ciphertext).not.toContain(plaintext);
    });

    it('produces different ciphertext on each call (random IV)', () => {
      const plaintext = 'Same input every time';
      const first = transformer.to(plaintext);
      const second = transformer.to(plaintext);
      // Different IVs mean the ciphertext must differ even for identical input
      expect(first).not.toBe(second);
    });

    it('returns undefined for undefined input', () => {
      expect(transformer.to(undefined)).toBeUndefined();
    });

    it('returns undefined for null input', () => {
      expect(transformer.to(null)).toBeUndefined();
    });

    it('encrypts an empty string without throwing', () => {
      const result = transformer.to('');
      // Empty string produces valid (non-empty) ciphertext
      expect(typeof result).toBe('string');
    });
  });

  // ------------------------------------------------------------------
  // Decryption — from()
  // ------------------------------------------------------------------

  describe('from() — decrypt on read', () => {
    it('restores the original plaintext after encrypt → decrypt', () => {
      const original = 'Walk the dog at 8am';
      const ciphertext = transformer.to(original) as string;
      const decrypted = transformer.from(ciphertext);
      expect(decrypted).toBe(original);
    });

    it('round-trips a multi-line description correctly', () => {
      const original = 'Line one\nLine two\nLine three';
      const ciphertext = transformer.to(original) as string;
      expect(transformer.from(ciphertext)).toBe(original);
    });

    it('round-trips a description with special characters', () => {
      const original = 'Tâche: vérifier l\'API & résoudre le bug #42 — "urgent"';
      const ciphertext = transformer.to(original) as string;
      expect(transformer.from(ciphertext)).toBe(original);
    });

    it('round-trips a long description (> 1 KB)', () => {
      const original = 'a'.repeat(1500);
      const ciphertext = transformer.to(original) as string;
      expect(transformer.from(ciphertext)).toBe(original);
    });

    it('returns undefined for undefined input', () => {
      expect(transformer.from(undefined)).toBeUndefined();
    });

    it('returns undefined for null input', () => {
      expect(transformer.from(null)).toBeUndefined();
    });
  });

  // ------------------------------------------------------------------
  // Key isolation — different key cannot decrypt
  // ------------------------------------------------------------------

  describe('key isolation', () => {
    it('throws or returns garbled output when decrypted with a wrong key', () => {
      const wrongKeyTransformer = new EncryptionTransformer({
        key: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        algorithm: 'aes-256-cbc',
        ivLength: 16,
      });

      const ciphertext = transformer.to('Super secret') as string;

      // Decrypting with the wrong key must not yield the original plaintext.
      // The library may throw or return garbled bytes — both are acceptable.
      let result: string | undefined;
      try {
        result = wrongKeyTransformer.from(ciphertext);
      } catch {
        // An error is the ideal outcome — key mismatch detected
        return;
      }
      expect(result).not.toBe('Super secret');
    });
  });
});
