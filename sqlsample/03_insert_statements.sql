INSERT INTO university (name, email_postfix) VALUES
('Columbia', '@columbia.edu'),
('NYU', '@nyu.edu'), 
('Baruch', '@baruch.edu'), 
('University of Vermont', '@uvm.edu'), 
('UC Berkeley', '@berkeley.edu'),
('MIT', '@mit.edu'),
('Harvard', '@harvard.edu'),
('University of Michigan', '@umich.edu'),
('Skidmore College', '@skidmore.edu'),
('UCLA', '@ucla.edu');

INSERT INTO sport (name) VALUES 
('Basketball'),
('Volleyball'),
('Soccer'),
('Football'),
('Tennis'),
('Squash'),
('Bouldering'),
('Swing dancing'),
('Pole dancing'),
('Swimming');

INSERT INTO degree_level (name) VALUES 
('Undergraduate'),
('Graduate'),
('PhD'),
('Faculty');

INSERT INTO skill_level (name) VALUES 
('Beginners'),
('Intermediate'),
('Advanced'),
('Professional');

INSERT INTO gender (name) VALUES 
('Male'),
('Female'),
('Other');

INSERT INTO users (first_name, last_name, birth_date, email, image_url, uniid) VALUES
('Annie', 'Lovjer', '05/14/1996', 'al3273@columbia.edu', '/www/8965483a-e4c7-40de-b56f-1f9685a9453a.png', 1),
('Benny', 'Schifferer', '02/26/1990', 'bds2141@columbia.edu', '/www/eb3265ae-d8f4-4851-b39c-3cb59d3807ab.png', 1),
('Petra', 'Pan', '07/20/1995', 'pp1234@columbia.edu', NULL, 1);
INSERT INTO users (first_name, last_name, email, birth_date, image_url, uniid) VALUES
('Tom', 'Gianapolous', 'tg1690@columbia.edu', '06/21/1994', NULL, 1),
('Jackie', 'Smith', 'js1234@columbia.edu','09/05/1996', NULL, 1),
('Sylvia', 'Husic', 'sh8364@columbia.edu','10/15/1996', NULL, 1),
('Miran', 'Tikvicki','mt0192@nyu.edu',  '02/15/1996', NULL, 2),
('Oscar', 'Smedberg','os4672@nyu.edu', '06/28/1988', NULL, 2),
('Joel', 'Jensen', 'jj2894@nyu.edu','04/13/1989', NULL, 2),
('James', 'Jensen','jj0129@nyu.edu', '07/10/1995', NULL, 2),
('Anna', 'Maric', 'am18293@nyu.edu', '02/14/1991', NULL, 2),
('Kristina', 'Gomez','kg7205@baruch.edu', '03/16/1991', NULL, 3),
('Tereza', 'Camaj', 'tc8273@baruch.edu','04/14/1992', NULL, 3),
('Lynn', 'Johansson', 'lj7382@baruch.edu','05/09/1994', NULL, 3);

INSERT INTO location (name, address, opening_hours) VALUES 
('Dodge Fitness Center', '3030 Broadway, New York, NY 10027', 'Monday 6AM–12AM<br>
Tuesday 6AM–12AM<br>
Wednesday 6AM–12AM<br>
Thursday 6AM–12AM<br>
Friday 6AM–10PM<br>
Saturday 10AM–10PM<br>
Sunday 10AM–12AM'),
('NYU 404 Fitness', '404 Lafayette St, New York, NY 10003', 'Monday 7:30AM–9:30PM<br>
Tuesday 7:30AM–9:30PM<br>
Wednesday 7:30AM–9:30PM<br>
Thursday 7:30AM–9:30PM<br>
Friday 7:30AM–9:30PM<br>
Saturday 8:30AM–7:30PM<br>
Sunday 8:30AM–7:30PM'),
('Steep Rock West', '3225 Broadway, New York, NY 10027', 'Monday 08:00AM–11:00PM<br>
Tuesday 08:00AM–11:00PM<br>
Wednesday 08:00AM–11:00PM<br>
Thursday 08:00AM–11:00PM<br>
Friday 08:00AM–11:00PM<br>
Saturday 09:00AM–10:00PM<br>
Sunday 09:00AM–10:00PM'),
('Steep Rock Bouldering', '1506 Lexington Ave, New York, NY 10029', 'Monday 08:00AM–11:00PM<br>
Tuesday 08:00AM–11:00PM<br>
Wednesday 08:00AM–11:00PM<br>
Thursday 08:00AM–11:00PM<br>
Friday 08:00AM–11:00PM<br>
Saturday 09:00AM–10:00PM<br>
Sunday 09:00AM–10:00PM<br>'),
('BodyStrength Fitness', '250 West 106th Street 2nd FL, New York, NY 10025', 'Monday 06:00AM–10:00PM<br>
Tuesday 06:00AM–10:00PM<br>
Wednesday 06:00AM–10:00PM<br>
Thursday 06:00AM–10:00PM<br>
Friday 06:00AM–10:00PM<br>
Saturday 08:00AM–08:00PM<br>
Sunday 08:00AM–08:00PM'),
('Central Rock Gym', '21 West End Ave, New York, NY 10069', 'Monday 06:00AM–11:00PM<br>
Tuesday 10:00AM–11:00PM<br>
Wednesday 06:00AM–11:00PM<br>
Thursday 10:00AM–11:00PM<br>
Friday 06:00AM–11:00PM<br>
Saturday 08:00AM–09:00PM<br>
Sunday 08:00AM–09:00PM'),
('Club Fitness New York', '31-11 Broadway, Astoria, NY 11106', 'Monday 05:00AM–00:00AM<br>
Tuesday 05:00AM–00:00AM<br>
Wednesday 05:00AM–00:00AM<br>
Thursday 05:00AM–00:00AM<br>
Friday 05:00AM–11:00PM<br>
Saturday 08:00AM–08:00PM<br>
Sunday 08:00AM–08:00PM'),
('BeFitNYC', '2726 Broadway 2nd Floor, New York, NY 10025', 'Monday 07:00AM–09:00PM<br>
Tuesday 07:00AM–09:00PM<br>
Wednesday 07:00AM–09:00PM<br>
Thursday 07:00AM–09:00PM<br>
Friday 07:00AM–08:30PM<br>
Saturday 08:00AM–06:00PM<br>
Sunday 08:00AM–06:00PM<br>'),
('The Cliffs at LIC', '11-11 44th Dr, Long Island City, NY 11101', 'Monday 06:00AM–00:00AM<br>
Tuesday 06:00AM–00:00AM<br>
Wednesday 06:00AM–00:00AM<br>
Thursday 06:00AM–00:00AM<br>
Friday 06:00AM–00:00AM<br>
Saturday 09:00AM–10:00PM<br>
Sunday 09:00AM–10:00PM'),
('24 Hour Fitness', '153 E 53rd St, New York, NY 10022', 'Monday 24 hours<br>
Tuesday 24 hours<br>
Wednesday 24 hours<br>
Thursday 24 hours<br>
Friday 24 hours<br>
Saturday 24 hours<br>
Sunday 24 hours');
 
INSERT INTO groups(name, description, capacity, image_url, created_user_id, sport) VALUES 
('Columbia Bouldering', 'Bouldering together at Steep rock', 100, '/www/26448b15-af9a-47ac-b57c-5ae979972d74.png', 2, 'Bouldering'),
('Squash together', 'Looking for a squash partner', 2, '/www/8056a38d-c939-422f-99f6-342dae7531bc.png', 5, 'Squash'),
('NYU Hobby Basketball', 'Hobby basketball group', 10, NULL, 8, 'Basketball'),
('Columbia Basketball for Girls', 'Girls only', 10, '/www/c6e1363a-bbe4-4b8d-b84a-9cf1d6a02913.png', 6, 'Basketball'),
('Columbia Swimming Undergrad', 'Every Monday swimming for Columbia students', 25, '/www/b69c5c40-867d-49be-aa62-7398496ec8a5.png', 3, 'Swimming'),
('CU Swing', 'We dance swing in NYC', 10, NULL, 4, 'Swing dancing'),
('Tennis partner wanted', 'Looking for a tennis partner', 2, NULL, 7, 'Tennis'),
('Professional soccer', 'We train 4times a week soccer', 24, NULL, 9, 'Soccer'),
('NYU Volleyball professional', 'We train every Monday', 10, NULL, 7, 'Volleyball'),
('Columbia Footbal', 'Hobby football group - everyone welcome', 100, NULL, 9, 'Football');

INSERT INTO groups_degree_level(gid, degree_level) VALUES 
(5, 'Undergraduate'),
(2, 'PhD'),
(7, 'Faculty'),
(10, 'Undergraduate'),
(10, 'Graduate'),
(10, 'PhD'),
(3, 'PhD'),
(3, 'Graduate'),
(4, 'Graduate'),
(4, 'Undergraduate');
 
INSERT INTO groups_skill_level(gid, skill_level) VALUES 
(10, 'Beginners'),
(9, 'Professional'),
(1, 'Beginners'),
(1, 'Advanced'),
(1, 'Intermediate'),
(1, 'Professional'),
(3, 'Beginners'),
(2, 'Beginners'),
(7, 'Advanced'),
(4, 'Beginners');
 
INSERT INTO users_join_groups(userid, gid) VALUES 
(2, 1),
(5, 2),
(8, 3),
(6, 4),
(3, 5),
(4, 6),
(7, 7),
(9, 8),
(7, 9),
(9, 10),
(1, 1),
(4, 1),
(8, 9),
(9, 9);

INSERT INTO groups_gender(gid, gender) VALUES 
(1, 'Male'),
(1, 'Female'),
(4, 'Female'),
(3, 'Male'),
(7, 'Female'),
(6, 'Male'),
(6, 'Female'),
(8, 'Male'),
(10, 'Female'),
(9, 'Male');

INSERT INTO events(name, recurrency, time, lid, userid, gid) VALUES 
('Weekly Training', 'Weekly', 'Thursday 6PM-8PM', 3, 2, 1),
('Competition', 'One time', 'Saturday, 2nd March 8:30AM', 3, 2, 6),
('Weekly Practice', 'Weekly', 'Mondays 8PM-10PM', 2, 7, 9),
('Bi-Weekly Training', 'Bi-Weekly', 'Sunday 10AM-12PM', 1, 3, 5),
('Monday Training', 'Weekly', 'Monday 6PM-8PM', 2, 8, 3),
('Wednesday Training', 'Weekly', 'Wednesday 6PM-8PM', 2, 8, 3),
('Friday Training', 'Weekly', 'Friday 6PM-8PM', 2, 8, 3),
('Tournament Game', 'One time', 'Tuesday, 20th April 6PM-8PM', 2, 8, 3),
('Monthly playing together', 'Monthly', 'Saturdays', 1, 5, 2),
('Game against Columbia', 'One time', 'Tuesday, 20th April 6PM-8PM', 1, 7, 9);
 
INSERT INTO message(userid, gid, message) VALUES
(2, 1, 'Hi everyone, do you want to having a climbing practice this Thursday?'),
(1, 1, 'Sounds, great! Lets do it!'),
(1, 1, 'Can someone please share their chalk with me today!'),
(4, 1, 'Training with Coach P tonight! Dont be late!'),
(5, 2, 'I am glad you joined the group! What days are you free to play?'),
(7, 9, 'Can anyone not make the game on Wednesday?'),
(8, 9, 'I wont be able to make it, but Ill be at Fridays practice.'),
(9, 9, 'I also cant come, sorry!'),
(8, 9, 'No worries, we still have enough people for a game.'),
(8, 3, 'Pick up game Tuesday night!');
