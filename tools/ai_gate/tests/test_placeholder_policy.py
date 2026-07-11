from __future__ import annotations

import unittest

from tools.ai_gate.check_ai_gate import PLACEHOLDER_RE


class PlaceholderPolicyTests(unittest.TestCase):
    def test_standalone_zero_placeholder_is_rejected(self):
        text = "Substantive report section containing standalone dummy token 0000000 for replacement."
        self.assertIsNotNone(PLACEHOLDER_RE.search(text))

    def test_zero_sequence_inside_alphanumeric_hash_is_accepted(self):
        text = "Substantive report section cites legitimate hash fragment abc0000000def without a placeholder."
        self.assertIsNone(PLACEHOLDER_RE.search(text))


if __name__ == "__main__":
    unittest.main()
