Budget calculator tool developed using vanilla JS and IndexedDB API. It has dark and light mode implementation.

The main goal of this website is to help the user keep his finances in order and complete control. This will help the user to be aware of the amount of money we squander when buying unnecessary things, and hopefully will help him to start making changes.

I've implemented all the basic CRUD (create, read, update, delete) operations using IndexedDB. In order to help the user being organized, every income and expense added has it's own title, description, amount and exact date. On each month you'll see your financial balance and one general of the entire year. Also the website shows you the percentage of expenses in relation to incomes of the year.

It also has filter options for the months and a search box. If you are starting a fresh new year or just want to start with a blank balance you can click on "new budget" on top of the page, this will erease all the data stored.

Because all the data is stored using IndexedDB, your information will never get out of you're device and it is complitely bond with the session, this has safety and privacy advantages, but it can be impractical if you want to access your balance from a different device.

