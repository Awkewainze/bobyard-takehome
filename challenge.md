Getting started
We are going to build comment functionality (similar to that of YouTube or Reddit). Download this JSON file to get started, it has a list of comments that you will use as data.

JSON file: https://drive.google.com/file/d/1a2nJ1ErJRGyt_oQr-heP4xT97SZRPs1N/view?usp=sharing

Part 1: Backend
Using any database, language, and framework, set up a simple RESTful backend API. Please use what you are comfortable with, we expect you to be able to demo all its functionality & build new features upon it during a follow up. (Bobyard uses Django Rest framework with PostgreSQL, so slight preference for that stack.)

Implement edit, add, and delete functionality to comments. Update the database accordingly when these APIs are called.

Requirements:
Edit text of existing comments
Add a comment, with new text (from “Admin” user), with the current time
Delete existing comments
List all comments

Part 2: Frontend setup
Please create a simple React.js page displaying these comments. We are judging the code quality/readability and design of the page.

Requirements:
Get the data from the backend
Need to display the text, author, date, likes, and images for the comments
Clean design

Part 3: Frontend edit, add, and delete
Now add edit, add, and delete functionality to comments (pretend that the user is the admin and can change any of the comments). Use the APIs you just made in the backend.

Requirements:
Edit text of existing comments
Add a comment with new text (from “Admin” user), with the current time
Delete comments

Submission
Upload to Ashby or put your solution on GitHub and link in notes for me to clone. Slight preference for a notebook, so there are no worries about the environment (please include readme for setup if otherwise).

Deadline
3-5 days
