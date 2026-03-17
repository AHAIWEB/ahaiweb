
-- Seed 8 divisions
INSERT INTO divisions (name, bn_name) VALUES
('Barishal', 'বরিশাল'),
('Chattogram', 'চট্টগ্রাম'),
('Dhaka', 'ঢাকা'),
('Khulna', 'খুলনা'),
('Mymensingh', 'ময়মনসিংহ'),
('Rajshahi', 'রাজশাহী'),
('Rangpur', 'রংপুর'),
('Sylhet', 'সিলেট')
ON CONFLICT DO NOTHING;
