-- Same-account A -> B and B -> A transfers within 24 hours, amounts within 10%.
SELECT
  ab.account_from AS account_a,
  ab.account_to AS account_b,
  ab.transfer_id AS outbound_transfer_id,
  ba.transfer_id AS return_transfer_id,
  ab.amount AS outbound_amount,
  ba.amount AS return_amount,
  ab.transferred_at AS outbound_at,
  ba.transferred_at AS return_at
FROM transfers AS ab
JOIN transfers AS ba
  ON ba.account_from = ab.account_to
 AND ba.account_to = ab.account_from
 AND ba.transfer_id <> ab.transfer_id
 AND ba.transferred_at > ab.transferred_at
 AND ba.transferred_at <= ab.transferred_at + INTERVAL '24 hours'
 AND ABS(ba.amount - ab.amount) <= ab.amount * 0.10
WHERE ab.account_from < ab.account_to
ORDER BY ab.transferred_at;
