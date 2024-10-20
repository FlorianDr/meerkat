ALTER SEQUENCE conferences_id_seq RESTART WITH 1;
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
INSERT INTO conferences (name)
VALUES (
		'Devcon 6'
	) ON CONFLICT DO NOTHING;
INSERT INTO events (
		conference_id,
		uid,
		title,
		submission_type,
		start,
		"end",
		abstract,
		description,
		track,
		cover
	)
VALUES (
		1,
		'EVT001',
		'Dark Forest: Lessons from 3 Years of On-Chain Gaming',
		'Talk',
		'2022-01-01 09:00:00',
		'2022-01-01 17:00:00',
		'Abstract 1',
		'We''ll present an overview of learnings from 3 years of building and running Dark Forest, the first fully decentralized MMORTS, including: why ZK is important for games, what a crypto-native game is and why we should care, designing for emergent player behavior, pushing the limits of Ethereum devex, and social consensus and legitimacy - why is Dark Forest more like chess than League of Legends? We''ll also hint at 0xPARC''s next crypto-gaming experiments.',
		'Track 1',
		'https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg'
	) ON CONFLICT DO NOTHING;
INSERT INTO users (uid, name)
VALUES ('01j513yxhnf66t1m7awr087d9m', 'vibrant-barking-deer-57d6') ON CONFLICT DO NOTHING;
INSERT INTO questions (uid, event_id, question, user_id)
VALUES (
		'01j4yc358mf4xrd5aqj8kvj75t',
		1,
		'What''s next?',
		1
	),
	(
		'01j4yc3mdzfz396p4e67f3731m',
		1,
		'Why build a crypto-native game?',
		1
	) ON CONFLICT DO NOTHING;
INSERT INTO votes (question_id, user_id)
VALUES (
		1,
		1
	) ON CONFLICT DO NOTHING;
INSERT INTO features (name, active) VALUES ('anonymous-login', true) ON CONFLICT DO NOTHING;