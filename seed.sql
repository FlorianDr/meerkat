-- Seed data for conferences table
-- Auth config taken from https://github.com/proofcarryingdata/zupass/blob/main/packages/lib/zuauth/src/configs/ethberlin.ts
INSERT INTO conferences (name, zu_auth_config)
VALUES (
		'ETHBerlin04',
		'[{ "pcdType": "eddsa-ticket-pcd", "publicKey": ["1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003", "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"], "eventId": "53edb3e7-6733-41e0-a9be-488877c5c572", "eventName": "ETHBerlin04" }]'
	);
INSERT INTO events (
		conference_id,
		uid,
		code,
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
		'01j4yc358mf4xrd5aqj8kvj75t',
		'EVT001',
		'Event 1',
		'Workshop',
		'2022-01-01 09:00:00',
		'2022-01-01 17:00:00',
		'Abstract 1',
		'Description 1',
		'Track 1',
		'Cover 1'
	),
	(
		1,
		'01j4yc3mdzfz396p4e67f3731m',
		'EVT002',
		'Event 2',
		'Talk',
		'2022-01-02 10:00:00',
		'2022-01-02 12:00:00',
		'Abstract 2',
		'Description 2',
		'Track 2',
		'Cover 2'
	);
INSERT INTO users (uid)
VALUES ('01j513yxhnf66t1m7awr087d9m');
INSERT INTO questions (uid, event_id, question, user_id)
VALUES (
		'01j4yc358mf4xrd5aqj8kvj75t',
		1,
		'What is the purpose of this event?',
		1
	),
	(
		'01j4yc3mdzfz396p4e67f3731m',
		1,
		'Can you provide more details about the schedule?',
		1
	);