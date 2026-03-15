-- Insert fake messages for group conversation ID 1 -------------------------------------------------------------------------------------------------
INSERT INTO public."Message" (content, "isDeleted", type, "isRead", "createdAt", "updatedAt", "userId", "conversationId")
VALUES
-- Day 1: Introduction to web development journey
('Hey guys! How''s everyone doing? I''ve been diving deep into web development lately and wanted to chat about it.', false, 'TEXT', true, '2024-01-15 09:15:00', '2024-01-15 09:15:00', 1, 1),
('Hey! I''m good thanks. Yeah I''m on the same path, just finished HTML basics and starting CSS this week. It''s pretty exciting!', false, 'TEXT', true, '2024-01-15 09:17:30', '2024-01-15 09:17:30', 2, 1),
('Same here! HTML was straightforward but CSS feels overwhelming with all the properties and layouts. Any tips?', false, 'TEXT', true, '2024-01-15 09:20:15', '2024-01-15 09:20:15', 3, 1),
('I felt the same way at first. The key is to practice building small projects. I started with a simple portfolio page.', false, 'TEXT', true, '2024-01-15 09:22:40', '2024-01-15 09:22:40', 1, 1),
('That''s a good idea! What resources are you guys using? I''m watching YouTube tutorials but feel like I need something more structured.', false, 'TEXT', true, '2024-01-15 09:25:10', '2024-01-15 09:25:10', 2, 1),

-- Day 2: Sharing resources and experiences
('I''m using The Odin Project. It''s free and really comprehensive. They have a great curriculum for full-stack development.', false, 'TEXT', true, '2024-01-16 14:20:00', '2024-01-16 14:20:00', 3, 1),
('Oh I''ve heard about that! How far along are you?', false, 'TEXT', true, '2024-01-16 14:22:15', '2024-01-16 14:22:15', 1, 1),
('Just finished the foundations path. Now starting with JavaScript basics. It''s challenging but the projects are really helpful.', false, 'TEXT', true, '2024-01-16 14:25:30', '2024-01-16 14:25:30', 3, 1),
('I''ve been using FreeCodeCamp. Their responsive design certification was really good for CSS practice.', false, 'TEXT', true, '2024-01-16 14:28:45', '2024-01-16 14:28:45', 2, 1),
('Has anyone tried building actual websites yet?', false, 'TEXT', true, '2024-01-16 14:30:20', '2024-01-16 14:30:20', 1, 1),

-- Day 3: Discussing projects and challenges
('I built a simple landing page for a fake coffee shop. Nothing fancy but it works! Used flexbox for the first time.', false, 'TEXT', true, '2024-01-17 11:10:00', '2024-01-17 11:10:00', 2, 1),
('That sounds cool! Flexbox took me a while to understand. Did you use any frameworks?', false, 'TEXT', true, '2024-01-17 11:12:30', '2024-01-17 11:12:30', 3, 1),
('No frameworks, wanted to understand pure CSS first. But I''m curious about Bootstrap and Tailwind.', false, 'TEXT', true, '2024-01-17 11:15:45', '2024-01-17 11:15:45', 2, 1),
('I tried Tailwind recently and honestly it''s amazing. Makes styling so much faster once you get used to the classes.', false, 'TEXT', true, '2024-01-17 11:18:20', '2024-01-17 11:18:20', 1, 1),
('Really? I''ve been hesitant to try it. Doesn''t it make HTML messy with all those classes?', false, 'TEXT', true, '2024-01-17 11:20:55', '2024-01-17 11:20:55', 3, 1),

-- Day 4: Deep dive into JavaScript
('Speaking of JavaScript, I just learned about arrow functions and template literals. Game changer!', false, 'TEXT', true, '2024-01-18 16:40:00', '2024-01-18 16:40:00', 1, 1),
('Wait till you get to array methods like map and filter. They make coding so much cleaner.', false, 'TEXT', true, '2024-01-18 16:42:15', '2024-01-18 16:42:15', 2, 1),
('I''m still struggling with closures and scope. Anyone have good explanations?', false, 'TEXT', true, '2024-01-18 16:45:30', '2024-01-18 16:45:30', 3, 1),
('Think of closures as functions remembering their lexical scope even when executed outside. Took me forever to get it too.', false, 'TEXT', true, '2024-01-18 16:48:45', '2024-01-18 16:48:45', 1, 1),
('Check out "You Don''t Know JS" book series. It explains these concepts really well.', false, 'TEXT', true, '2024-01-18 16:50:20', '2024-01-18 16:50:20', 2, 1),

-- Day 5: Future plans and motivation
('What are your goals for the next few months?', false, 'TEXT', true, '2024-01-19 13:10:00', '2024-01-19 13:10:00', 1, 1),
('I want to build a full-stack project by summer. Maybe a task management app.', false, 'TEXT', true, '2024-01-19 13:12:30', '2024-01-19 13:12:30', 2, 1),
('Nice! I''m aiming to get comfortable with React and start applying for junior positions.', false, 'TEXT', true, '2024-01-19 13:15:45', '2024-01-19 13:15:45', 3, 1),
('That''s ambitious! I''m thinking of specializing in front-end first, then expand to backend later.', false, 'TEXT', true, '2024-01-19 13:18:20', '2024-01-19 13:18:20', 1, 1),
('We should do a group project together sometime. Would be great for learning and portfolios.', false, 'TEXT', true, '2024-01-19 13:20:55', '2024-01-19 13:20:55', 2, 1),
('That''s a brilliant idea! Count me in. We can practice using Git and collaborating.', false, 'TEXT', true, '2024-01-19 13:23:10', '2024-01-19 13:23:10', 3, 1),
('Perfect! Let''s brainstorm ideas next week. I''ll create a shared doc for suggestions.', false, 'TEXT', true, '2024-01-19 13:25:40', '2024-01-19 13:25:40', 1, 1),
('Sounds like a plan! This conversation really motivated me. Thanks guys!', false, 'TEXT', true, '2024-01-19 13:28:15', '2024-01-19 13:28:15', 2, 1),
('Same here! Learning together makes it so much better. Catch up tomorrow!', false, 'TEXT', true, '2024-01-19 13:30:00', '2024-01-19 13:30:00', 3, 1);

-- Insert pplanning a trip conversation between users 1 and 2 in private chat 3 ---------------------------------------------------------------------
INSERT INTO public."Message" (content, "isDeleted", type, "isRead", "createdAt", "updatedAt", "userId", "conversationId")
VALUES
-- Brother 1 initiates the trip idea
('Hey bro! You free this weekend? Was thinking we could do something together.', false, 'TEXT', true, '2024-03-10 09:15:00', '2024-03-10 09:15:00', 1, 3),
('Yeah I''m free! What did you have in mind? Been stuck at home all week.', false, 'TEXT', true, '2024-03-10 09:17:30', '2024-03-10 09:17:30', 2, 3),
('Maybe a road trip to the mountains? Weather looks perfect for hiking.', false, 'TEXT', true, '2024-03-10 09:20:45', '2024-03-10 09:20:45', 1, 3),
('That sounds awesome! Remember our last hiking trip? You got lost for an hour haha', false, 'TEXT', true, '2024-03-10 09:23:10', '2024-03-10 09:23:10', 2, 3),
('Very funny! At least I found my way back. Unlike someone who forgot the tent poles.', false, 'TEXT', true, '2024-03-10 09:25:40', '2024-03-10 09:25:40', 1, 3),

-- Discussing plans
('Okay okay, we both made mistakes haha. Which mountain should we go to?', false, 'TEXT', true, '2024-03-10 09:28:15', '2024-03-10 09:28:15', 2, 3),
('What about that trail near the lake? The one with the great view at the top.', false, 'TEXT', true, '2024-03-10 09:30:50', '2024-03-10 09:30:50', 1, 3),
('Perfect! Should we invite anyone else or just us brothers?', false, 'TEXT', true, '2024-03-10 09:33:20', '2024-03-10 09:33:20', 2, 3),
('I was thinking just us. Been a while since we hung out without other people.', false, 'TEXT', true, '2024-03-10 09:35:45', '2024-03-10 09:35:45', 1, 3),
('Yeah you''re right. Quality brother time. What time should we leave?', false, 'TEXT', true, '2024-03-10 09:38:10', '2024-03-10 09:38:10', 2, 3),

-- Logistics and preparation
('Early morning like 7am? Beat the crowd and the heat.', false, 'TEXT', true, '2024-03-10 09:40:30', '2024-03-10 09:40:30', 1, 3),
('7am on a weekend? You know I hate waking up early!', false, 'TEXT', true, '2024-03-10 09:42:55', '2024-03-10 09:42:55', 2, 3),
('Come on lazy bones, it''ll be worth it. I''ll bring coffee and your favorite breakfast sandwich.', false, 'TEXT', true, '2024-03-10 09:45:20', '2024-03-10 09:45:20', 1, 3),
('Okay fine, you got me at breakfast sandwich. What should I bring?', false, 'TEXT', true, '2024-03-10 09:47:45', '2024-03-10 09:47:45', 2, 3),
('Bring water bottles and some snacks. I''ll handle the lunch stuff and first aid kit.', false, 'TEXT', true, '2024-03-10 09:50:10', '2024-03-10 09:50:10', 1, 3),
('Don''t forget sunscreen this time! Last time you got burned so bad.', false, 'TEXT', true, '2024-03-10 09:52:35', '2024-03-10 09:52:35', 2, 3),
('Haha yeah I learned my lesson. You bring extra sunglasses? I lost mine.', false, 'TEXT', true, '2024-03-10 09:55:00', '2024-03-10 09:55:00', 1, 3),
('Classic you. Yeah I have an extra pair. You owe me though!', false, 'TEXT', true, '2024-03-10 09:57:20', '2024-03-10 09:57:20', 2, 3),

-- Excitement building
('Dude I''m actually really excited. Been stressed with work lately.', false, 'TEXT', true, '2024-03-10 10:00:00', '2024-03-10 10:00:00', 1, 3),
('Me too bro. This trip is exactly what we need. Nothing beats nature therapy.', false, 'TEXT', true, '2024-03-10 10:02:30', '2024-03-10 10:02:30', 2, 3),
('Should we check the weather forecast?', false, 'TEXT', true, '2024-03-10 10:05:15', '2024-03-10 10:05:15', 1, 3),
('Already did! Sunny and clear skies. Perfect hiking weather.', false, 'TEXT', true, '2024-03-10 10:07:40', '2024-03-10 10:07:40', 2, 3),
('Nice! What about the trail difficulty? Is it good for beginners?', false, 'TEXT', true, '2024-03-10 10:10:05', '2024-03-10 10:10:05', 1, 3),
('Moderate level but we can take breaks. You''re fit enough don''t worry.', false, 'TEXT', true, '2024-03-10 10:12:30', '2024-03-10 10:12:30', 2, 3),

-- Final planning
('Okay I''ll map out the route tonight. Should we pack swimsuits? There''s a lake right?', false, 'TEXT', true, '2024-03-10 10:15:00', '2024-03-10 10:15:00', 1, 3),
('Good thinking! Water might be cold though. You know I''m brave enough haha', false, 'TEXT', true, '2024-03-10 10:17:25', '2024-03-10 10:17:25', 2, 3),
('Brave or crazy? Remember when you jumped in that freezing river?', false, 'TEXT', true, '2024-03-10 10:20:50', '2024-03-10 10:20:50', 1, 3),
('And it was awesome! Best memory ever. Let''s make more memories like that.', false, 'TEXT', true, '2024-03-10 10:23:15', '2024-03-10 10:23:15', 2, 3),
('For sure bro. Love you, can''t wait for Saturday.', false, 'TEXT', true, '2024-03-10 10:25:40', '2024-03-10 10:25:40', 1, 3),
('Love you too man. I''ll be ready at 7am sharp!', false, 'TEXT', true, '2024-03-10 10:28:00', '2024-03-10 10:28:00', 2, 3),
('Don''t be late or I''m eating your breakfast sandwich!', false, 'TEXT', true, '2024-03-10 10:30:25', '2024-03-10 10:30:25', 1, 3),
('Haha wouldn''t expect anything less. See you soon bro!', false, 'TEXT', true, '2024-03-10 10:32:50', '2024-03-10 10:32:50', 2, 3);

-- Insert polite romantic conversation between users 1 and 3 in private chat 2 ----------------------------------------------------------------------
INSERT INTO public."Message" (content, "isDeleted", type, "isRead", "createdAt", "updatedAt", "userId", "conversationId")
VALUES
-- Morning greetings
('Good morning! I hope you slept well. Thinking of you as always.', false, 'TEXT', true, '2024-02-01 07:30:00', '2024-02-01 07:30:00', 1, 2),
('Good morning! I slept well thank you. Woke up with a smile thinking about you too.', false, 'TEXT', true, '2024-02-01 07:32:15', '2024-02-01 07:32:15', 3, 2),
('That makes me so happy to hear. What are your plans for today?', false, 'TEXT', true, '2024-02-01 07:35:40', '2024-02-01 07:35:40', 1, 2),
('Just work as usual, but looking forward to our call later. You always make my day better.', false, 'TEXT', true, '2024-02-01 07:38:20', '2024-02-01 07:38:20', 3, 2),

-- Midday check-in
('Hi beautiful! Just had lunch and thought of you. Did you eat yet?', false, 'TEXT', true, '2024-02-01 13:15:00', '2024-02-01 13:15:00', 1, 2),
('Hi love! Yes I just finished. Had your favorite pasta today, made me miss you even more.', false, 'TEXT', true, '2024-02-01 13:17:30', '2024-02-01 13:17:30', 3, 2),
('Aww you''re so sweet. We should make it together next time we meet.', false, 'TEXT', true, '2024-02-01 13:20:45', '2024-02-01 13:20:45', 1, 2),
('I''d love that! Cooking with you is always the best part of my week.', false, 'TEXT', true, '2024-02-01 13:23:10', '2024-02-01 13:23:10', 3, 2),

-- Afternoon thoughts
('Just got out of a meeting and couldn''t stop thinking about our weekend plans. I''m really excited to see you.', false, 'TEXT', true, '2024-02-01 15:45:00', '2024-02-01 15:45:00', 1, 2),
('Me too! I''ve been counting the days. What should we do?', false, 'TEXT', true, '2024-02-01 15:47:20', '2024-02-01 15:47:20', 3, 2),
('Maybe dinner at that new place you mentioned? Then a walk by the river like we love.', false, 'TEXT', true, '2024-02-01 15:50:35', '2024-02-01 15:50:35', 1, 2),
('That sounds perfect! Any evening with you is magical honestly.', false, 'TEXT', true, '2024-02-01 15:53:00', '2024-02-01 15:53:00', 3, 2),

-- Evening wind-down
('Finally done with work! How was your afternoon?', false, 'TEXT', true, '2024-02-01 18:20:00', '2024-02-01 18:20:00', 1, 2),
('Busy but productive. Kept smiling every time I got a message from you though.', false, 'TEXT', true, '2024-02-01 18:22:40', '2024-02-01 18:22:40', 3, 2),
('That''s the effect you have on me too. What are you having for dinner?', false, 'TEXT', true, '2024-02-01 18:25:15', '2024-02-01 18:25:15', 1, 2),
('Just something light, salad maybe. Trying to eat healthier like you suggested.', false, 'TEXT', true, '2024-02-01 18:28:30', '2024-02-01 18:28:30', 3, 2),
('Proud of you! Want to video call in an hour? Can''t wait to see your face.', false, 'TEXT', true, '2024-02-01 18:30:50', '2024-02-01 18:30:50', 1, 2),
('I''d love that! I''ll make sure I look pretty for you.', false, 'TEXT', true, '2024-02-01 18:33:10', '2024-02-01 18:33:10', 3, 2),
('You always look beautiful to me. Okay talk soon, can''t wait!', false, 'TEXT', true, '2024-02-01 18:35:25', '2024-02-01 18:35:25', 1, 2),

-- Night time sweet messages
('That call was exactly what I needed. You make every day brighter.', false, 'TEXT', true, '2024-02-01 22:15:00', '2024-02-01 22:15:00', 3, 2),
('I feel the same way. Sleep well my love, sweet dreams about us.', false, 'TEXT', true, '2024-02-01 22:18:30', '2024-02-01 22:18:30', 1, 2),
('Goodnight! Can''t wait to talk to you tomorrow morning.', false, 'TEXT', true, '2024-02-01 22:21:45', '2024-02-01 22:21:45', 3, 2),
('Goodnight beautiful, dreaming of you always ❤️', false, 'TEXT', true, '2024-02-01 22:25:00', '2024-02-01 22:25:00', 1, 2);