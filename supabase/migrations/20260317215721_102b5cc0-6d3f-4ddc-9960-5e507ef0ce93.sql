
DO $$
DECLARE
  dummy_user uuid := '00000000-0000-0000-0000-000000000001';
  people_cat uuid := '6f6606a1-b39e-4a6d-8f12-0989530f1b82';
  column_cat uuid := '520fad63-a706-4a6f-ae1f-03bc0600e672';
  writing_cat uuid := 'a5c9fcbb-a301-44d0-8be5-e5731de5c1f1';
  national_cat uuid := '016757d5-229f-478b-9ef0-4401468d2fc3';
BEGIN
  INSERT INTO posts (title, slug, content, excerpt, status, post_type, category_id, user_id, featured_image, published_at) VALUES
  ('আব্দুল করিম - গ্রামের শিক্ষক', 'abdul-karim-teacher', 'গ্রামের প্রাথমিক বিদ্যালয়ের শিক্ষক আব্দুল করিম গত ৩০ বছর ধরে নিরলসভাবে শিক্ষার আলো জ্বালিয়ে যাচ্ছেন।', 'গ্রামের শিক্ষক আব্দুল করিমের গল্প', 'published', 'editor', people_cat, dummy_user, 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', now()),
  ('ফাতেমা বেগম - নারী উদ্যোক্তা', 'fatema-begum-entrepreneur', 'ফাতেমা বেগম মাত্র ৫০০ টাকা পুঁজি নিয়ে শুরু করেছিলেন তাঁর ব্যবসা।', 'নারী উদ্যোক্তা ফাতেমা বেগমের গল্প', 'published', 'editor', people_cat, dummy_user, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', now()),
  ('রফিকুল ইসলাম - কৃষিবিদ', 'rafiqul-islam-farmer', 'রফিকুল ইসলাম আধুনিক কৃষি পদ্ধতি ব্যবহার করে গ্রামের কৃষিতে বিপ্লব এনেছেন।', 'কৃষিবিদ রফিকুল ইসলামের গল্প', 'published', 'editor', people_cat, dummy_user, 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400', now()),
  ('সালমা আক্তার - স্বাস্থ্যকর্মী', 'salma-akhter-health', 'গ্রামের স্বাস্থ্যকর্মী সালমা আক্তার প্রতিদিন দূর-দূরান্তে গিয়ে মানুষের সেবা করেন।', 'স্বাস্থ্যকর্মী সালমা আক্তারের গল্প', 'published', 'editor', people_cat, dummy_user, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', now());

  INSERT INTO posts (title, slug, content, excerpt, status, post_type, category_id, user_id, published_at) VALUES
  ('গ্রামীণ অর্থনীতি ও ডিজিটাল বাংলাদেশ', 'rural-economy-digital', 'ডিজিটাল বাংলাদেশের স্বপ্ন বাস্তবায়নে গ্রামীণ অর্থনীতির ভূমিকা অপরিসীম।', 'ডিজিটাল বাংলাদেশ ও গ্রামীণ অর্থনীতি', 'published', 'editor', column_cat, dummy_user, now()),
  ('শিক্ষায় বৈষম্য: শহর ও গ্রাম', 'education-gap', 'শহর ও গ্রামের মধ্যে শিক্ষার মানের ব্যবধান ক্রমশ বাড়ছে।', 'শিক্ষায় শহর-গ্রাম বৈষম্য', 'published', 'editor', column_cat, dummy_user, now()),
  ('জলবায়ু পরিবর্তন ও ভবিষ্যৎ', 'climate-change-bd', 'জলবায়ু পরিবর্তনের প্রভাব বাংলাদেশে সবচেয়ে বেশি অনুভূত হচ্ছে।', 'জলবায়ু পরিবর্তন নিয়ে মতামত', 'published', 'editor', column_cat, dummy_user, now()),
  ('স্থানীয় সরকার: সমস্যা ও সম্ভাবনা', 'local-govt-issues', 'স্থানীয় সরকার ব্যবস্থা শক্তিশালী করতে পারলে গ্রামীণ উন্নয়ন আরও গতিশীল হবে।', 'স্থানীয় সরকার নিয়ে বিশ্লেষণ', 'published', 'editor', column_cat, dummy_user, now());

  INSERT INTO posts (title, slug, content, excerpt, status, post_type, category_id, user_id, is_featured, published_at) VALUES
  ('পদ্মার পাড়ে এক সন্ধ্যা', 'padmar-pare', 'পদ্মার পাড়ে বসে সন্ধ্যার রং দেখা — এ যেন জীবনের এক অপার্থিব অভিজ্ঞতা।', 'পদ্মার পাড়ে সন্ধ্যার রূপ', 'published', 'editor', writing_cat, dummy_user, true, now()),
  ('গ্রামের হাটের দিন', 'gramer-hat', 'সপ্তাহে দুইদিন গ্রামের হাট বসে। সেদিন গ্রামে যেন উৎসবের আমেজ।', 'গ্রামের হাটের বর্ণনা', 'published', 'editor', writing_cat, dummy_user, false, now()),
  ('বর্ষায় বাংলাদেশ', 'borshay-bd', 'বর্ষাকালে বাংলাদেশ যেন এক অন্য রূপ ধারণ করে।', 'বর্ষায় বাংলাদেশের রূপ', 'published', 'editor', writing_cat, dummy_user, false, now());

  INSERT INTO posts (title, slug, content, excerpt, status, post_type, category_id, user_id, is_featured, published_at) VALUES
  ('সারাদেশে নতুন শিক্ষাক্রম চালু', 'new-curriculum', 'সারাদেশের বিদ্যালয়ে নতুন শিক্ষাক্রম চালু হয়েছে।', 'নতুন শিক্ষাক্রম চালু', 'published', 'editor', national_cat, dummy_user, true, now()),
  ('ডিজিটাল সেবা গ্রামে পৌঁছাচ্ছে', 'digital-rural', 'সরকারের ডিজিটাল কর্মসূচির আওতায় গ্রামে সেবা পৌঁছাচ্ছে।', 'গ্রামে ডিজিটাল সেবা', 'published', 'editor', national_cat, dummy_user, false, now());
END $$;
